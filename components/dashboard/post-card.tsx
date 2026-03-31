"use client"

import { ChevronLeft, ChevronRight, MoreVertical, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useState, useRef, useEffect } from "react"

interface PostCardProps {
  post: any
  showDelete?: boolean
  onDelete?: (postId: string) => void
}

export default function PostCard({ post, showDelete = false, onDelete }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // For now, handle single image/video. Can be extended for multiple media
  const mediaItems: { type: string; url: string }[] = []
  if (post.imageUrl) mediaItems.push({ type: 'image', url: post.imageUrl })
  if (post.videoUrl) mediaItems.push({ type: 'video', url: post.videoUrl })

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)

    // Try to delete from database (sample posts won't have real DB IDs)
    const isSamplePost = String(post.id).startsWith("sample-")

    if (!isSamplePost) {
      try {
        const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Server error ${res.status}`)
        }
      } catch (err: any) {
        console.error("Delete failed:", err.message)
        setDeleteError(err.message || "Failed to delete post")
        setDeleting(false)
        return // Don't remove from UI if DB delete failed
      }
    }

    // Only reach here if delete succeeded (or it's a sample post)
    // Clean up localStorage too
    try {
      const localPosts = localStorage.getItem("posts")
      if (localPosts) {
        const parsed = JSON.parse(localPosts)
        const updated = parsed.filter((p: any) => p.id !== post.id)
        localStorage.setItem("posts", JSON.stringify(updated))
      }
      // Persist deleted ID so the feed filters it out on every re-fetch
      const raw = localStorage.getItem("deletedPostIds")
      const deletedIds: string[] = raw ? JSON.parse(raw) : []
      if (!deletedIds.includes(post.id)) {
        deletedIds.push(post.id)
        localStorage.setItem("deletedPostIds", JSON.stringify(deletedIds))
      }
    } catch {}

    setMenuOpen(false)
    setDeleting(false)
    // Notify parent to remove from list
    if (onDelete) onDelete(post.id)
    // Broadcast to other components on the same page
    window.dispatchEvent(new CustomEvent("postDeleted", { detail: post.id }))
  }

  return (
    <div className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent transition-all hover:scale-[1.011] shadow-2xl">
      <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl overflow-hidden border border-white/5 shadow-inner">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-[14px] bg-black flex items-center justify-center font-black italic text-white uppercase tracking-tighter">
                {post.author.charAt(0)}
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-black text-white uppercase tracking-tight italic group-hover:text-purple-400 transition-colors cursor-pointer">{post.author}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{timeAgo}</span>
            </div>
          </div>

          {/* Three-dot menu (only on profile page) */}
          {showDelete && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                title="Post options"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 z-50 min-w-[160px] bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    {deleting ? "Deleting…" : "Delete Post"}
                  </button>
                  {deleteError && (
                    <p className="text-[10px] text-red-500 px-4 pb-3">{deleteError}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Media Carousel */}
        {mediaItems.length > 0 && (
          <div className="relative bg-black/40 group/media overflow-hidden border-b border-white/5">
            {mediaItems[currentImageIndex].type === 'image' ? (
              <img
                src={mediaItems[currentImageIndex].url}
                alt="Post content"
                className="w-full object-contain max-h-[600px] transition-transform duration-700 group-hover/media:scale-[1.02]"
              />
            ) : (
              <video
                src={mediaItems[currentImageIndex].url}
                className="w-full object-contain max-h-[600px]"
                controls
              />
            )}

            {/* Navigation arrows */}
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-all hover:bg-black/80 hover:scale-110 z-10"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-all hover:bg-black/80 hover:scale-110 z-10"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {mediaItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-1 rounded-full transition-all ${index === currentImageIndex ? 'w-6 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'w-2 bg-white/30'
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Content Segment */}
        <div className="p-8">
          {post.content && (
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-transparent opacity-30 rounded-full" />
              <p className="text-gray-300 text-sm leading-relaxed italic font-medium">
                <span className="text-white font-black uppercase not-italic tracking-tighter mr-3 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{post.author}</span>
                {post.content}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}