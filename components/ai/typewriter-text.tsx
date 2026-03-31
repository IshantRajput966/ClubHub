"use client"

import { useState, useEffect, useMemo } from "react"
import ReactMarkdown from "react-markdown"

interface TypewriterTextProps {
  text: string
  speed?: number // ms per word
}

export function TypewriterText({ text, speed = 40 }: TypewriterTextProps) {
  // Guard: ensure text is always a non-undefined string
  const safeText = (text == null || text === "undefined") ? "" : String(text)

  const [displayedText, setDisplayedText] = useState("")
  const [isAnimating, setIsAnimating] = useState(true)

  // Split into tokens (words + whitespace), filtering out any undefined/empty artifacts
  const words = useMemo(() => {
    if (!safeText) return []
    // Split preserving whitespace tokens, then filter out any undefined or empty-string artifacts
    return safeText.split(/(\s+)/).filter((w): w is string => w !== undefined && w !== "")
  }, [safeText])

  useEffect(() => {
    setDisplayedText("")
    setIsAnimating(true)

    if (words.length === 0) {
      setIsAnimating(false)
      return
    }

    let currentIdx = 0
    let timeoutId: NodeJS.Timeout

    const animate = () => {
      if (currentIdx < words.length) {
        const word = words[currentIdx]
        // Extra guard: skip if somehow undefined crept in
        if (word !== undefined && word !== "undefined") {
          setDisplayedText(prev => prev + word)
        }
        currentIdx++
        timeoutId = setTimeout(animate, speed)
      } else {
        setIsAnimating(false)
      }
    }

    animate()

    return () => clearTimeout(timeoutId)
  }, [words, speed])

  // When animation is done, show the full safe text (avoids any partial rendering glitch)
  const rendered = isAnimating ? displayedText : safeText

  return (
    <div className={`transition-opacity duration-500 ${isAnimating ? 'opacity-90' : 'opacity-100'}`}>
      <ReactMarkdown
        components={{
          h3: ({ node, ...props }) => (
            <h3 className="text-purple-300 font-bold mt-4 mb-2 flex items-center gap-2 text-sm uppercase tracking-widest border-l-2 border-purple-500 pl-2" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="space-y-2 my-3 pl-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="flex gap-3 text-gray-300 items-start group">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.5)] group-hover:scale-125 transition-transform" />
              <span className="leading-snug">{props.children}</span>
            </li>
          ),
          strong: ({ node, ...props }) => (
            <strong className="text-purple-400 font-bold drop-shadow-[0_0_5px_rgba(168,85,247,0.3)]" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-3 last:mb-0 leading-relaxed" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/30 underline-offset-4 transition-colors" {...props} />
          )
        }}
      >
        {rendered}
      </ReactMarkdown>
      {isAnimating && (
        <span className="inline-block w-1.5 h-4 bg-purple-500/50 animate-pulse ml-1 rounded-full align-middle" />
      )}
    </div>
  )
}
