"use client"

import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"

export default function PostCard({ post }: any) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  // For now, handle single image/video. Can be extended for multiple media
  const mediaItems = []
  if (post.imageUrl) mediaItems.push({ type: 'image', url: post.imageUrl })
  if (post.videoUrl) mediaItems.push({ type: 'video', url: post.videoUrl })

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{post.author.charAt(0)}</span>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-white">{post.author}</span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
        </div>

        <button className="text-gray-400 hover:text-white transition">
          <MoreHorizontal size={18} />
        </button>

      </div>

      {/* Image/Video Carousel */}
      {mediaItems.length > 0 && (
        <div className="relative bg-black group">
          {mediaItems[currentImageIndex].type === 'image' ? (
            <img
              src={mediaItems[currentImageIndex].url}
              alt="Post content"
              className="w-full object-contain max-h-[600px]"
              style={{ aspectRatio: 'auto' }}
            />
          ) : (
            <video
              src={mediaItems[currentImageIndex].url}
              className="w-full object-contain max-h-[600px]"
              controls
              style={{ aspectRatio: 'auto' }}
            />
          )}

          {/* Navigation arrows */}
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
        <div className="flex gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition ${
              liked ? "text-pink-400" : "text-gray-400 hover:text-pink-400"
            }`}
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
          </button>

          <button className="text-gray-400 hover:text-blue-400 transition">
            <MessageCircle size={20} />
          </button>

          <button className="text-gray-400 hover:text-green-400 transition">
            <Share2 size={20} />
          </button>
        </div>

        <button className="text-gray-400 hover:text-yellow-400 transition">
          <Bookmark size={20} />
        </button>
      </div>

      {/* Likes Count */}
      {(liked || likeCount > 0) && (
        <div className="px-4 py-2 text-sm font-semibold text-white">
          {likeCount > 0 && `${likeCount} likes`}
          {liked && !likeCount && "You liked this"}
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3">
        {post.content && (
          <p className="text-white text-sm leading-relaxed">
            <span className="font-semibold text-white mr-2">{post.author}</span>
            {post.content}
          </p>
        )}
      </div>

      {/* View Comments */}
      <div className="px-4 py-2 border-t border-white/10">
        <button className="text-xs text-gray-400 hover:text-gray-300 transition">
          View all comments
        </button>
      </div>

    </div>
  )
}