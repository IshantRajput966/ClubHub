// app/api/matchmaker/route.ts
import { NextResponse } from 'next/server';
import { ChatGroq } from '@langchain/groq';
import { prisma } from '@/lib/prisma';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getSession } from "@/lib/auth-utils"
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// Create the Tool that allows the AI to submit a join request
const submitJoinRequestTool = tool(
  async ({ clubId, username, message }) => {
    try {
      // Check if user is already a member
      const existingMember = await prisma.clubMember.findFirst({
        where: { clubId, username },
      });
      if (existingMember) return `User ${username} is already a member of this club.`;

      // Check if a request already exists
      const existingRequest = await prisma.joinRequest.findFirst({
        where: { clubId, username },
      });
      if (existingRequest) return `A pending join request already exists for this club.`;

      await prisma.joinRequest.create({
        data: {
          clubId,
          username,
          message,
          status: 'pending',
        },
      });
      return `Successfully submitted join request for ${username} to club (ID: ${clubId}) with the personalized pitch.`;
    } catch (error) {
      console.error('Error submitting join request via agent tool:', error);
      return `Failed to submit join request due to a database error.`;
    }
  },
  {
    name: 'submit_join_request',
    description: 'ONLY call this tool if the user says an EXPLICIT "YES" or "PLEASE JOIN" to joining a specific club. DO NOT call this tool if the user is just asking for more information.',
    schema: z.object({
      clubId: z.string().describe('The ID of the club the user wants to join.'),
      username: z.string().describe('The username of the user requesting to join.'),
      message: z.string().describe('A comprehensive pitch message summarizing the user\'s experience and interests that they shared during this chat, to convince the club leader to accept them. Use their exact words where helpful.'),
    }),
  }
);

const tools = [submitJoinRequestTool];

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages } = await req.json();
    const username = session.username;

    // Initialize the Groq model
    const llm = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      maxTokens: 1024,
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    });

    // Fetch all clubs, EXCLUDING ones the user is already a member of
    const clubs = await prisma.club.findMany({
      where: {
        NOT: {
          members: {
            some: { username }
          }
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        domain: true,
      },
    });

    console.log('Matchmaker Context - Clubs found:', clubs.length);
    if (clubs.length === 0) {
      console.warn('WARNING: No clubs found in database for Matchmaker context!');
    }

    const clubsContext = clubs.map(c => `- ${c.name} (ID: ${c.id}, Domain: ${c.domain}): ${c.description}`).join('\n');

    const systemPrompt = `You are AuraBot, the interactive, friendly, and helpful Matchmaker Agent for the university's ClubHub platform. Your goal is to interview the user, understand their interests and past experiences, and recommend the best clubs for them to join.

    You are talking to user: ${username}

    Once you recommend a club, ask them if they want you to submit a join request on their behalf.
    
    CRITICAL AI BEHAVIOR RULES:
    1. NEVER submit a join request unless the user EXPLICITLY confirms they want to join a SPECIFIC club (e.g., "Yes, join Club X").
    2. If the user asks for more information about a club, DO NOT submit a join request. Provide the information first.
    3. If the user says something ambiguous like "ok" when you gave multiple options, ASK FOR CLARIFICATION on which specific club they want to join.
    4. When calling the tool, you MUST generate a highly detailed and persuasive 'message' field summarizing the user's specific skills, past experiences, and interests that they have shared with you!
    5. To prevent infinite loops: If the 'submit_join_request' tool returns an error or says a request already exists, DO NOT try to call the tool again. Simply relay the message to the user and move on.
    
    Here is the list of active clubs on campus:
    ${clubsContext || "No clubs available at the moment. Please inform the user that club recruitment will start soon."}
    `;

    // Agent memory
    const agentMessages = [
      new SystemMessage(systemPrompt),
      ...messages.map((m: any) =>
        m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
      ),
    ];

    // Create a simple react agent executor
    const agent = createReactAgent({ llm, tools });

    const result = await agent.invoke({ messages: agentMessages });
    
    const finalMessage = result.messages[result.messages.length - 1];

    return NextResponse.json({
      role: 'assistant',
      content: finalMessage.content,
    });

  } catch (error: any) {
    console.error('Matchmaker API Error:', error);
    return NextResponse.json(
      { error: error?.message || error.toString() },
      { status: 500 }
    );
  }
}
