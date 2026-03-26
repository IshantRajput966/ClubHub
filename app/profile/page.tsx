"use client"

import { useState, useEffect } from "react"
import CreatePostModal from "@/components/dashboard/create-post-modal"
import PostCard from "@/components/dashboard/post-card"
import { Edit2, Share2, MapPin, Calendar } from "lucide-react"

export default function ProfilePage() {
  const [username, setUsername] = useState("")
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("username") || "Student User"
    setUsername(stored)
    loadPosts()
  }, [])

  async function loadPosts() {
    try {
      setLoading(true)
      const res = await fetch("/api/posts")
      if (!res.ok) throw new Error("Failed to load posts")
      const data = await res.json()
      // Filter posts by current user
      const userPosts = data.filter((p: any) => p.author === username)
      setPosts(userPosts)
    } catch (err) {
      const localPosts = localStorage.getItem("posts")
      if (localPosts) {
        const allPosts = JSON.parse(localPosts)
        const userPosts = allPosts.filter((p: any) => p.author === username)
        setPosts(userPosts)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">

      {/* Header Background Blur */}
      <div className="h-48 bg-gradient-to-r from-purple-600/40 via-blue-600/40 to-purple-600/40 backdrop-blur-3xl border-b border-white/20"></div>

      {/* Profile Container */}
      <div className="max-w-5xl mx-auto px-4">

        {/* Profile Section */}
        <div className="relative -mt-24 mb-12 bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-end gap-8">

            {/* Avatar */}
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-purple-700 border-4 border-slate-900 flex items-center justify-center flex-shrink-0 shadow-2xl">
              <span className="text-6xl font-bold text-white">{username.charAt(0).toUpperCase()}</span>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{username}</h1>
              <p className="text-purple-300 text-lg mb-4 font-semibold">Club Member • Campus Student</p>
              <p className="text-gray-300 mb-6 max-w-xl leading-relaxed">
                Passionate about collaboration, learning, and campus community building. Active member of student clubs and proud contributor to campus initiatives.
              </p>

              <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-400">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                  <MapPin size={16} className="text-purple-400" />
                  <span>Campus</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                  <Calendar size={16} className="text-blue-400" />
                  <span>Joined January 2025</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mb-8">
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg px-4 py-3">
                  <p className="text-3xl font-bold text-white">{posts.length}</p>
                  <p className="text-purple-300 text-sm font-semibold">Posts</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg px-4 py-3">
                  <p className="text-3xl font-bold text-white">234</p>
                  <p className="text-blue-300 text-sm font-semibold">Followers</p>
                </div>
                <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 rounded-lg px-4 py-3">
                  <p className="text-3xl font-bold text-white">89</p>
                  <p className="text-pink-300 text-sm font-semibold">Following</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setOpenCreateModal(true)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-purple-500/50"
                >
                  Create Post
                </button>
                <button className="px-6 py-2 bg-white/10 border border-white/30 hover:bg-white/20 hover:border-white/50 text-white font-semibold rounded-lg transition flex items-center gap-2">
                  <Share2 size={18} />
                  Share
                </button>
                <button className="px-6 py-2 bg-white/10 border border-white/30 hover:bg-white/20 hover:border-white/50 text-white font-semibold rounded-lg transition">
                  <Edit2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        <CreatePostModal
          open={openCreateModal}
          setOpen={setOpenCreateModal}
          refreshFeed={loadPosts}
        />

        {/* Posts Section */}
        <div className="py-12">
          <h2 className="text-2xl font-bold text-white mb-8">Your Posts</h2>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <p className="text-gray-400 mt-3">Loading posts...</p>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <p className="text-gray-400 mb-4 text-lg">No posts yet</p>
              <button
                onClick={() => setOpenCreateModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition inline-block"
              >
                Create your first post
              </button>
            </div>
          )}

          {/* Posts Grid */}
          {!loading && posts.length > 0 && (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}