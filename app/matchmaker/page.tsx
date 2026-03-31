"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function MatchmakerPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm **AuraBot**, your personal ClubHub Matchmaker ✨\n\nTell me a bit about what you're studying, your hobbies, and what you're hoping to get out of a club!",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role") || localStorage.getItem("role");
    if (storedRole === "faculty") {
      window.location.href = "/dashboard";
      return;
    }

    const storedUser = sessionStorage.getItem("username") || localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    } else {
      setUsername("guest_" + Math.floor(Math.random() * 1000));
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !username) return;

    const newMessages = [...messages, { role: "user", content: input } as Message];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/matchmaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          username,
        }),
      });

      if (!response.ok) {
        let errStr = "Failed to fetch response";
        try {
          const errData = await response.json();
          errStr = errData?.error || errStr;
        } catch(e) {}
        throw new Error(errStr);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Error: " + error.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden flex text-white font-sans">
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen z-0">
        {/* Header */}
        <div className="h-24 border-b border-white/5 flex items-center px-10" style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)] ring-1 ring-white/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Aura Neural Engine</h1>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.2em] mt-1 italic">V.2.0 Active • Intelligent Matchmaking</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide" ref={scrollRef}>
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            {messages.map((m, index) => (
              <div 
                key={index} 
                className={"flex gap-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500 " + (m.role === "user" ? "justify-end" : "justify-start")}
              >
                {/* Bot Avatar */}
                {m.role !== "user" && (
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mt-1 shadow-xl ring-1 ring-white/5">
                    <Bot className="w-6 h-6 text-purple-400" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={
                  "p-6 rounded-[31px] text-sm leading-relaxed max-w-[80%] border " +
                  (m.role === "user" 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-sm border-white/10 shadow-[0_0_30px_rgba(147,51,234,0.2)] font-medium" 
                    : "bg-black/60 backdrop-blur-3xl border-white/5 text-gray-200 rounded-tl-sm shadow-2xl")
                }>
                  {m.role === "user" ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-p:leading-relaxed prose-strong:text-purple-300 prose-pre:bg-white/5 max-w-none text-gray-300">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {m.role === "user" && (
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mt-1 shadow-xl">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Thinking Indicator */}
            {isLoading && (
              <div className="flex gap-6 w-full justify-start animate-pulse">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-xl">
                  <Bot className="w-6 h-6 text-purple-400" />
                </div>
                <div className="p-6 rounded-[31px] bg-black/40 backdrop-blur-3xl border border-white/5 rounded-tl-sm shadow-2xl flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-10 border-t border-white/5" style={{ background: "rgba(0,0,0,0.1)", backdropFilter: "blur(12px)" }}>
          <div className="max-w-4xl mx-auto relative group">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
              className="relative flex items-center"
            >
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? "NEURAL ENGINE PROCESSING..." : "TRANSMIT QUERIES TO AURA..."}
                disabled={isLoading}
                className="w-full bg-white/[0.03] border border-white/10 rounded-[31px] py-6 pl-10 pr-20 text-white placeholder:text-gray-600 outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all font-bold tracking-tight text-sm shadow-2xl"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-3 top-3 bottom-3 aspect-square rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 disabled:opacity-50 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)]"
              >
                <Send className="w-6 h-6 text-white" />
              </button>
            </form>
            <p className="text-center text-[10px] text-gray-500 mt-5 font-black uppercase tracking-[0.2em] italic opacity-50">
              Aura Neural Engine v.2.0 • Decentralized Recommendation Protocol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
