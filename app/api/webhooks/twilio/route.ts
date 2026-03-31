import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notify } from "@/lib/notification-store"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const body = formData.get("Body")?.toString() || ""
    const from = formData.get("From")?.toString() || ""

    console.log(`Incoming SMS from ${from}: ${body}`)

    // Basic Command Parsing
    // Format: JOIN_APP <SHORT_ID> or JOIN_REJ <SHORT_ID>
    const parts = body.trim().split(/\s+/)
    if (parts.length < 2) {
      return new Response("<Response><Message>Invalid format. Use: JOIN_APP <ID> or JOIN_REJ <ID></Message></Response>", {
        headers: { "Content-Type": "text/xml" }
      })
    }

    const command = parts[0].toUpperCase()
    const shortId = parts[1].toUpperCase()

    // Find the request by the suffix of the ID
    // Note: In a production app, you'd store the shortId explicitly or use a more robust lookup.
    // For this implementation, we fetch all pending requests and match the suffix.
    const pendingRequests = await prisma.joinRequest.findMany({
      where: { status: "pending" },
      include: { club: true }
    })

    const joinReq = pendingRequests.find(r => r.id.slice(-6).toUpperCase() === shortId)

    if (!joinReq) {
      return new Response(`<Response><Message>Request ${shortId} not found or already processed.</Message></Response>`, {
        headers: { "Content-Type": "text/xml" }
      })
    }

    // Security Check: Verify sender is a leader/president of THAT club
    const leader = await prisma.member.findUnique({
      where: { phone: from }
    })

    if (!leader) {
        return new Response(`<Response><Message>Security Alert: Your phone number is not recognized as a club leader.</Message></Response>`, {
            headers: { "Content-Type": "text/xml" }
        })
    }

    const isAuthorized = await prisma.clubMember.findFirst({
        where: {
            clubId: joinReq.clubId,
            username: leader.username,
            role: { in: ['president', 'officer'] }
        }
    })

    if (!isAuthorized) {
        return new Response(`<Response><Message>You are not authorized to manage requests for ${joinReq.club.name}.</Message></Response>`, {
            headers: { "Content-Type": "text/xml" }
        })
    }

    let responseMessage = ""

    if (command === "JOIN_APP") {
      // Approve Request
      await prisma.$transaction([
        prisma.joinRequest.update({
          where: { id: joinReq.id },
          data: { status: "approved" }
        }),
        prisma.clubMember.upsert({
          where: { clubId_username: { clubId: joinReq.clubId, username: joinReq.username } },
          update: { role: "member" },
          create: { clubId: joinReq.clubId, username: joinReq.username, role: "member" }
        })
      ])

      notify(joinReq.username, {
        type: "request_approved",
        clubName: joinReq.club.name,
        clubId: joinReq.clubId,
        timestamp: Date.now()
      })

      responseMessage = `Approved! ${joinReq.username} is now a member of ${joinReq.club.name}.`
    } else if (command === "JOIN_REJ") {
      // Reject Request
      await prisma.joinRequest.update({
        where: { id: joinReq.id },
        data: { status: "rejected" }
      })

      notify(joinReq.username, {
        type: "request_rejected",
        clubName: joinReq.club.name,
        clubId: joinReq.clubId,
        timestamp: Date.now()
      })

      responseMessage = `Rejected request for ${joinReq.username} to join ${joinReq.club.name}.`
    } else {
      responseMessage = "Unknown command. Use JOIN_APP or JOIN_REJ."
    }

    // Return TwiML response
    return new Response(`<Response><Message>${responseMessage}</Message></Response>`, {
      headers: { "Content-Type": "text/xml" }
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return new Response("<Response><Message>Internal server error processing command.</Message></Response>", {
      headers: { "Content-Type": "text/xml" }
    })
  }
}
