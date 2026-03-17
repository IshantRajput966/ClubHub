import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import PersistentAIAgent from "@/components/ai/persistent-ai-agent"
import NotificationProvider from "@/components/notifications/notification-provider"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ClubHub",
  description: "Student Club Management Platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        {/* Global background — applied to every page */}
        <div className="fixed inset-0 -z-10">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
          />
          {/* Gradient overlay blending image with purple theme */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, rgba(0,0,0,0.82) 0%, rgba(8,4,20,0.75) 30%, rgba(20,8,50,0.70) 60%, rgba(45,15,90,0.65) 100%)",
            }}
          />
          {/* Ambient glow blobs */}
          <div
            className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.8) 0%, transparent 70%)", filter: "blur(60px)" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(88,28,220,0.6) 0%, transparent 70%)", filter: "blur(80px)" }}
          />
        </div>

        {children}
        <PersistentAIAgent />
        <NotificationProvider />
      </body>
    </html>
  )
}
