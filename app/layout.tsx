import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import PersistentAIAgent from "@/components/ai/persistent-ai-agent"
import NotificationProvider from "@/components/notifications/notification-provider"
import { RoleSync } from "@/components/layout/role-sync"

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
        <div className="fixed inset-0 -z-10 bg-[#010109]">
          {/* Volumetric Corner Lighting */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
          </div>
          {/* Subtle noise or texture could be added here if desired */}
          <div 
            className="absolute inset-0 mix-blend-overlay opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
          />
        </div>

        {children}
        <RoleSync />
        <PersistentAIAgent />
        <NotificationProvider />
      </body>
    </html>
  )
}
