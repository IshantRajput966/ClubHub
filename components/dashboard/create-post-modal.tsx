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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-slate-950 backdrop-blur-xl rounded-2xl w-[600px] max-h-[90vh] border border-purple-500/30 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 rounded-t-2xl bg-slate-950">
          <h2 className="text-xl font-bold text-white">Create Post</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Error State */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Content Textarea */}
          <div>
            <textarea
              className="w-full bg-white/10 border border-purple-500/30 p-3 rounded-lg outline-none text-white placeholder-gray-500 focus:bg-white/15 focus:border-purple-500/60 transition"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <div className="text-xs text-gray-400 mt-2">
              {content.length} characters
            </div>
          </div>

          {/* Media Preview */}
          {mediaPreviews.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Media ({mediaPreviews.length})</span>
                {mediaPreviews.length > 1 && (
                  <span className="text-xs text-gray-400">Multiple images will be displayed as a carousel</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    {mediaFiles[index]?.type.startsWith("image/") ? (
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border border-purple-500/30"
                      />
                    ) : (
                      <video
                        src={preview}
                        className="w-full aspect-square object-cover rounded-lg border border-purple-500/30"
                        muted
                      />
                    )}
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} className="text-white" />
                    </button>
                    {mediaPreviews.length > 1 && (
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {index + 1}/{mediaPreviews.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
              dragActive
                ? "border-purple-400 bg-purple-400/20"
                : "border-purple-500/40 bg-purple-500/10 hover:border-purple-400"
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

            <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload size={24} className="text-purple-400" />
              <p className="text-white font-semibold">Upload Photos or Videos</p>
              <p className="text-xs text-gray-400">Drag and drop or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">Max 10MB each • PNG, JPG, GIF, MP4, WebM • Multiple files supported</p>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-purple-500/20 bg-slate-950 rounded-b-2xl">
          <button
            onClick={() => setOpen(false)}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={createPost}
            disabled={loading || !content.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader size={16} className="animate-spin" />}
            {loading ? "Posting..." : "Post"}
          </button>
        </div>

      </div>
    </div>
  )
}