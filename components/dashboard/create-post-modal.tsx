"use client"

import { useState } from "react"
import { X, Loader, Upload } from "lucide-react"

export default function CreatePostModal({
  open,
  setOpen,
  refreshFeed,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  refreshFeed: () => void
}) {
  const [content, setContent] = useState("")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  function handleFileChange(files: FileList | null) {
    if (!files) return

    const newFiles = Array.from(files)
    const validFiles: File[] = []
    const validPreviews: string[] = []

    for (const file of newFiles) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Each file must be less than 10MB")
        return
      }

      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError("Only image and video files are allowed")
        return
      }

      validFiles.push(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          validPreviews.push(e.target.result as string)
          if (validPreviews.length === validFiles.length) {
            setMediaPreviews(prev => [...prev, ...validPreviews])
          }
        }
      }
      reader.readAsDataURL(file)
    }

    setMediaFiles(prev => [...prev, ...validFiles])
    setError(null)
  }

  function removeMedia(index: number) {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
    setMediaPreviews(prev => prev.filter((_, i) => i !== index))
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileChange(files)
    }
  }

  async function createPost() {
    if (!content.trim()) {
      setError("Post content cannot be empty")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // For now, use the first media file (can be extended to support multiple)
      const firstMedia = mediaFiles[0]

      const postData = {
        author: localStorage.getItem("username") || "Anonymous User",
        content: content.trim(),
        imageUrl: null as string | null,
        videoUrl: null as string | null,
        createdAt: new Date().toISOString(),
        id: Math.random().toString(36).substring(2),
      }

      if (firstMedia) {
        if (firstMedia.type.startsWith("image/")) {
          postData.imageUrl = mediaPreviews[0]
        } else if (firstMedia.type.startsWith("video/")) {
          postData.videoUrl = mediaPreviews[0]
        }
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (!res.ok) {
        // If API fails, fallback to localStorage
        console.log("Database unavailable, saving to localStorage")
        const existingPosts = localStorage.getItem("posts")
        const posts = existingPosts ? JSON.parse(existingPosts) : []
        posts.unshift(postData)
        localStorage.setItem("posts", JSON.stringify(posts))
      }

      setContent("")
      setMediaFiles([])
      setMediaPreviews([])
      setOpen(false)
      refreshFeed()
    } catch (err) {
      console.log("API error, using localStorage fallback")
      const existingPosts = localStorage.getItem("posts")
      const posts = existingPosts ? JSON.parse(existingPosts) : []
      const firstMedia = mediaFiles[0]
      const postData = {
        author: localStorage.getItem("username") || "Anonymous User",
        content: content.trim(),
        imageUrl: firstMedia?.type.startsWith("image/") ? mediaPreviews[0] : null,
        videoUrl: firstMedia?.type.startsWith("video/") ? mediaPreviews[0] : null,
        createdAt: new Date().toISOString(),
        id: Math.random().toString(36).substring(2),
      }
      posts.unshift(postData)
      localStorage.setItem("posts", JSON.stringify(posts))
      
      setContent("")
      setMediaFiles([])
      setMediaPreviews([])
      setOpen(false)
      refreshFeed()
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-md p-6">
      <div 
        className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent shadow-2xl w-full max-w-[640px] animate-in fade-in zoom-in duration-300"
        style={{ transform: "perspective(1000px) rotateX(1deg)" }}
      >
        <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl overflow-hidden border border-white/5 flex flex-col shadow-inner">

          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Upload className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Initiate Signal</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1 italic">Neural Broadcast Preparation</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-10 py-8 space-y-8 max-h-[70vh]">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                {error}
              </div>
            )}

            {/* Input Segment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Signal Payload</span>
                <span className={`text-[10px] font-bold tabular-nums ${content.length > 280 ? 'text-rose-500' : 'text-gray-600'}`}>
                  {content.length} / 500
                </span>
              </div>
              <textarea
                className="w-full bg-white/[0.03] border border-white/5 p-6 rounded-[24px] outline-none text-white placeholder-gray-700 focus:bg-white/[0.05] focus:border-purple-500/30 transition-all font-medium italic text-lg shadow-inner min-h-[160px] resize-none"
                placeholder="What's on your mind today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* Media Interlock */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Visual Matrix</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="group/preview relative aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-lg">
                      {mediaFiles[index]?.type.startsWith("image/") ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover grayscale-[0.3] group-hover/preview:grayscale-0 transition-all duration-500" />
                      ) : (
                        <video src={preview} className="w-full h-full object-cover" muted />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <button
                          onClick={() => removeMedia(index)}
                          className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-white/70">
                        Entry {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative group/upload border-2 border-dashed rounded-[31px] p-10 text-center transition-all duration-300 ${
                  dragActive ? "border-purple-500 bg-purple-500/10 scale-[0.98]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                }`}
              >
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => handleFileChange(e.target.files)}
                />

                <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:rotate-6 transition-all duration-500 shadow-xl">
                    <Upload size={28} className="text-purple-500 group-hover/upload:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-widest">Inject Media Assets</p>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Drag and drop or sync locally</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Interaction Interlock */}
          <div className="px-10 py-8 border-t border-white/5 flex items-center justify-between bg-black/20">
            <button
              onClick={() => setOpen(false)}
              className="px-6 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              Abort
            </button>
            <button
              onClick={createPost}
              disabled={loading || !content.trim()}
              className="h-12 px-10 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-[0_0_25px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-3"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Broadcasting...
                </>
              ) : (
                "Broadcast Signal"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}