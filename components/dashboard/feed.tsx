"use client"

import { useEffect, useState } from "react"
import PostCard from "./post-card"

export default function Feed() {

  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useLocalStorage, setUseLocalStorage] = useState(false)

  // Sample posts to make the feed more engaging
  const samplePosts = [
    {
      id: "sample-1",
      author: "Alex Chen",
      content: "Just finished an amazing robotics workshop! 🤖 The kids built their first autonomous robots and it was incredible to see their creativity. Can't wait for the next session! #RoboticsClub #STEM",
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "sample-2",
      author: "Sarah Johnson",
      content: "Our coding club hackathon was a blast! 🚀 We had 15 teams working on innovative projects. The winner built an AI-powered study assistant. Proud of everyone's hard work! 💻",
      imageUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "sample-3",
      author: "Mike Rodriguez",
      content: "Photography club outing to the botanical gardens today 📸 The lighting was perfect and everyone captured some stunning shots. Nature never ceases to amaze!",
      imageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "sample-4",
      author: "Emma Davis",
      content: "Dance club performance tonight was electric! 💃 The energy from the audience was incredible. Grateful for such an amazing team and supportive community. ✨",
      imageUrl: "https://images.unsplash.com/photo-1504609773096-104ff2e818cf?w=800&h=600&fit=crop",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "sample-5",
      author: "David Kim",
      content: "Just wrapped up our first chess tournament of the semester ♟️ Intense matches and great sportsmanship all around. The winner showed incredible strategic thinking!",
      imageUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&h=600&fit=crop",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "sample-6",
      author: "Lisa Wang",
      content: "Art club exhibition opening was a success! 🎨 So proud of all the pieces our members created. From digital illustrations to traditional paintings, the talent is incredible.",
      imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop",
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "sample-7",
      author: "James Wilson",
      content: "Basketball game against rival school was intense! 🏀 Final score: 78-72. Great team effort and sportsmanship. Looking forward to the next match!",
      imageUrl: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&h=600&fit=crop",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "sample-8",
      author: "Anna Martinez",
      content: "Science fair winners announced! 🧪 Our club's projects took home 3 first places. From sustainable energy solutions to medical innovations, the future looks bright! 🔬",
      imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop",
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    }
  ]

  /** Read the set of post IDs this user has deleted (persisted in localStorage) */
  function getDeletedIds(): Set<string> {
    try {
      const raw = localStorage.getItem("deletedPostIds")
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  }

  async function loadPosts() {
    const deletedIds = getDeletedIds()
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/posts")
      if (!res.ok) throw new Error("Failed to load posts from database")
      const data = await res.json()

      // Always filter out any posts the user explicitly deleted
      const filteredData = data.filter((p: any) => !deletedIds.has(p.id))

      // Pad with sample posts if there aren't many real posts
      const allPosts = [...filteredData]
      if (allPosts.length < 5) {
        const existingIds = new Set(allPosts.map((p: any) => p.id))
        const newSamplePosts = samplePosts.filter(
          (p) => !existingIds.has(p.id) && !deletedIds.has(p.id)
        )
        allPosts.push(...newSamplePosts.slice(0, 5 - allPosts.length))
      }

      setPosts(allPosts)
      setUseLocalStorage(false)
    } catch (err) {
      console.log("Database not available, using localStorage fallback")
      const localPosts = localStorage.getItem("posts")
      let localList = localPosts ? JSON.parse(localPosts) : []

      // Filter deleted posts from localStorage too
      localList = localList.filter((p: any) => !deletedIds.has(p.id))

      if (localList.length < 3) {
        const existingIds = new Set(localList.map((p: any) => p.id))
        const newSamplePosts = samplePosts.filter(
          (p) => !existingIds.has(p.id) && !deletedIds.has(p.id)
        )
        localList = [...localList, ...newSamplePosts.slice(0, 5 - localList.length)]
      }

      setPosts(localList)
      setUseLocalStorage(true)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadPosts()
  }, [])

  // Re-fetch whenever the user navigates back to this tab/page
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadPosts()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  // Listen for real-time postDeleted events (fired from profile page in same session)
  useEffect(() => {
    const handlePostDeleted = (e: Event) => {
      const postId = (e as CustomEvent<string>).detail
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    }
    window.addEventListener("postDeleted", handlePostDeleted)
    return () => window.removeEventListener("postDeleted", handlePostDeleted)
  }, [])

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <p className="text-gray-400 mt-3">Loading posts...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-400">No posts yet. Visit the profile page to create one!</p>
        </div>
      )}

      {/* Posts */}
      {!loading &&
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

    </div>
  )
}