"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import CreatePostModal from "@/components/dashboard/create-post-modal"
import EditProfileModal from "@/components/profile/edit-profile-modal"
import PostCard from "@/components/dashboard/post-card"
import { Edit2, Share2, MapPin, Calendar } from "lucide-react"

export default function ProfilePage() {
  const [username, setUsername] = useState("")
  const [originalUsername, setOriginalUsername] = useState("")
  const [bio, setBio] = useState("")
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("username") || "Student User"
    const storedOriginal = localStorage.getItem("originalUsername") || sessionStorage.getItem("username") || ""
    const storedBio = localStorage.getItem("bio") || "Passionate about collaboration, learning, and campus community building. Active member of student clubs and proud contributor to campus initiatives."
    const storedPic = localStorage.getItem("profilePic")
    
    setUsername(storedUser)
    setOriginalUsername(storedOriginal)
    setBio(storedBio)
    setProfilePic(storedPic)
    loadPosts(storedUser)

    if (storedOriginal && !localStorage.getItem("originalUsername")) {
      localStorage.setItem("originalUsername", storedOriginal)
    }
  }, [])

  async function loadPosts(user?: string) {
    const authorName = user || username
    if (!authorName) return
    try {
      setLoading(true)
      const res = await fetch("/api/posts")
      if (!res.ok) throw new Error("Failed to load posts")
      const data = await res.json()
      // Filter posts by current user
      const userPosts = data.filter((p: any) => p.author === authorName)
      setPosts(userPosts)
    } catch (err) {
      const localPosts = localStorage.getItem("posts")
      if (localPosts) {
        const allPosts = JSON.parse(localPosts)
        const userPosts = allPosts.filter((p: any) => p.author === authorName)
        setPosts(userPosts)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  const handleSaveProfile = (data: { username: string; bio: string; profilePic: string | null }) => {
    setUsername(data.username)
    setBio(data.bio)
    setProfilePic(data.profilePic)
    
    localStorage.setItem("username", data.username)
    localStorage.setItem("bio", data.bio)
    if (data.profilePic) {
      localStorage.setItem("profilePic", data.profilePic)
    } else {
      localStorage.removeItem("profilePic")
    }

    // Store as a global override keyed by original login username
    const overridesStr = localStorage.getItem("profile_overrides") || "{}"
    const overrides = JSON.parse(overridesStr)
    if (originalUsername) {
      overrides[originalUsername] = {
        name: data.username,
        pic: data.profilePic,
        bio: data.bio
      }
      localStorage.setItem("profile_overrides", JSON.stringify(overrides))
    }

    // Dispatch for live sidebar update
    window.dispatchEvent(new Event("profileUpdate"))
    
    // Refresh posts in case username changed
    loadPosts(data.username)
    setOpenEditModal(false)
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden text-white font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto scrollbar-hide z-0">
        {/* Ambient Top Glow */}
        <div className="h-64 bg-gradient-to-b from-purple-600/20 to-transparent absolute top-0 left-0 right-0 pointer-events-none" />

        <div className="max-w-5xl mx-auto p-10 relative">
          
          {/* Profile Section */}
          <div className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent transition-all mb-12 shadow-2xl">
            <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl p-10 border border-white/5 shadow-inner">
              <div className="flex flex-col md:flex-row md:items-center gap-10">

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-44 h-44 rounded-[40px] bg-gradient-to-br from-purple-500 to-blue-600 p-1 shadow-[0_0_40px_rgba(147,51,234,0.3)] overflow-hidden">
                    <div className="w-full h-full rounded-[36px] bg-black flex items-center justify-center overflow-hidden">
                      {profilePic ? (
                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-7xl font-black italic tracking-tighter text-white">{username.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-emerald-500 border-4 border-black flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">{username}</h1>
                    <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-black uppercase tracking-widest text-purple-400">Verified Account</div>
                  </div>
                  <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-6 italic">Member • Intelligence Stream Alpha</p>
                  
                  <div className="relative px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl mb-8 italic text-gray-400 text-sm leading-relaxed max-w-2xl">
                    &quot;{bio}&quot;
                  </div>

                  <div className="flex flex-wrap gap-4 mb-10">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-colors hover:text-white">
                      <MapPin size={14} className="text-purple-500" />
                      <span>Indore Command</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-colors hover:text-white">
                      <Calendar size={14} className="text-blue-500" />
                      <span>Core Origin: Jan 2025</span>
                    </div>
                  </div>

                  {/* Stats & Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-8">
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-3xl font-black italic text-white leading-none">{posts.length}</p>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">Posts</p>
                      </div>
                      <div className="w-px h-10 bg-white/5" />
                      <div className="text-center">
                        <p className="text-3xl font-black italic text-white leading-none">234</p>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">Followers</p>
                      </div>
                      <div className="w-px h-10 bg-white/5" />
                      <div className="text-center">
                        <p className="text-3xl font-black italic text-white leading-none">89</p>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">Followed</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setOpenCreateModal(true)}
                        className="h-12 px-8 rounded-[20px] bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition-all text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                      >
                        Initiate Post
                      </button>
                      <button className="w-12 h-12 rounded-[20px] bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-all text-gray-400 hover:text-white" title="Share Identity">
                        <Share2 size={18} />
                      </button>
                      <button 
                        onClick={() => setOpenEditModal(true)}
                        className="w-12 h-12 rounded-[20px] bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-all text-gray-400 hover:text-white" 
                        title="Modify Config"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">My Posts</h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-full border-t-2 border-purple-500 animate-spin" />
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-[31px] bg-white/[0.02] border border-white/5 p-20 text-center shadow-inner">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 mb-6">No posts yet. Share something with your community!</p>
                <button
                  onClick={() => setOpenCreateModal(true)}
                  className="h-10 px-8 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/[0.08] transition-all"
                >
                  Initiate Post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    showDelete={true}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreatePostModal
        open={openCreateModal}
        setOpen={setOpenCreateModal}
        refreshFeed={() => loadPosts()}
      />

      <EditProfileModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        currentUsername={username}
        currentBio={bio}
        currentProfilePic={profilePic}
        onSave={handleSaveProfile}
      />
    </div>
  )
}