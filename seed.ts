import { prisma } from "./lib/prisma"

async function main() {
  // Create some sample clubs
  const clubs = [
    {
      name: "Tech Innovators",
      description: "A club for technology enthusiasts and innovators exploring the latest in software development, AI, and emerging technologies.",
      domain: "tech",
      createdBy: "lakshya_dev",
    },
    {
      name: "Sports Warriors",
      description: "Join us for competitive sports, fitness training, and team-building activities across various sports disciplines.",
      domain: "sports",
      createdBy: "lakshya_dev",
    },
    {
      name: "Art & Design Studio",
      description: "Express your creativity through painting, digital art, photography, and design projects in a supportive community.",
      domain: "arts",
      createdBy: "lakshya_dev",
    },
    {
      name: "Science Explorers",
      description: "Dive deep into scientific research, experiments, and discussions on physics, chemistry, biology, and environmental science.",
      domain: "science",
      createdBy: "lakshya_dev",
    },
    {
      name: "Cultural Fusion",
      description: "Celebrate diversity through cultural events, traditional performances, international cuisine, and cross-cultural exchanges.",
      domain: "cultural",
      createdBy: "lakshya_dev",
    },
    {
      name: "Music & Performance",
      description: "Showcase your musical talents, learn instruments, and participate in concerts, musicals, and performance arts.",
      domain: "arts",
      createdBy: "lakshya_dev",
    },
  ]

  for (const club of clubs) {
    await prisma.club.upsert({
      where: { name: club.name },
      update: {},
      create: club,
    })
    console.log(`Created/Updated club: ${club.name}`)
  }

  // Create a sample member
  await prisma.member.upsert({
    where: { username: "lakshya_dev" },
    update: {},
    create: {
      username: "lakshya_dev",
      email: "lakshya@example.com",
      role: "member",
      bio: "Club enthusiast and developer",
    },
  })

  // Add the user to a couple of clubs
  const techClub = await prisma.club.findFirst({ where: { name: "Tech Innovators" } })
  const artClub = await prisma.club.findFirst({ where: { name: "Art & Design Studio" } })

  if (techClub && artClub) {
    await prisma.clubMember.upsert({
      where: {
        clubId_username: {
          clubId: techClub.id,
          username: "lakshya_dev",
        },
      },
      update: {},
      create: {
        clubId: techClub.id,
        username: "lakshya_dev",
        role: "member",
      },
    })

    await prisma.clubMember.upsert({
      where: {
        clubId_username: {
          clubId: artClub.id,
          username: "lakshya_dev",
        },
      },
      update: {},
      create: {
        clubId: artClub.id,
        username: "lakshya_dev",
        role: "member",
      },
    })

    console.log("Added user to Tech Innovators and Art & Design Studio")
  }

  // Create sample announcements
  const announcements = [
    {
      title: "Welcome to ClubHub!",
      content: "We're excited to launch ClubHub, your one-stop platform for discovering and joining student clubs. Explore various domains and connect with like-minded peers.",
      author: "lakshya_dev",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    {
      title: "Tech Innovators Meeting",
      content: "Join us for our first meeting of the semester! We'll discuss upcoming projects and welcome new members. Pizza will be provided.",
      author: "lakshya_dev",
    },
    {
      title: "Art Exhibition Opening",
      content: "The Art & Design Studio is hosting its annual exhibition. Come see amazing artworks from our talented members and vote for your favorites!",
      author: "lakshya_dev",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  ]

  for (const announcement of announcements) {
    await prisma.announcement.create({
      data: announcement,
    })
    console.log(`Created announcement: ${announcement.title}`)
  }

  // Create sample events
  const events = [
    {
      title: "Tech Workshop: Introduction to React",
      description: "Learn the basics of React.js in this hands-on workshop. No prior experience required. Bring your laptop!",
      date: "2025-03-20",
      time: "14:00",
      location: "Computer Lab 101",
      organizer: "lakshya_dev",
      capacity: 30,
    },
    {
      title: "Art & Design Meetup",
      description: "Monthly meetup for art enthusiasts. Share your latest projects and get feedback from fellow artists.",
      date: "2025-03-25",
      time: "18:00",
      location: "Art Studio B",
      organizer: "lakshya_dev",
      capacity: 20,
    },
    {
      title: "Sports Day Registration",
      description: "Annual sports day is coming up! Register for various sports events and show your athletic skills.",
      date: "2025-04-01",
      time: "10:00",
      location: "Main Stadium",
      organizer: "lakshya_dev",
      capacity: 100,
    },
  ]

  for (const event of events) {
    await prisma.event.create({
      data: event,
    })
    console.log(`Created event: ${event.title}`)
  }

  // Create sample posts
  const posts = [
    {
      author: "Alex Chen",
      content: "Just finished an amazing robotics workshop! 🤖 The kids built their first autonomous robots and it was incredible to see their creativity. Can't wait for the next session! #RoboticsClub #STEM",
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    },
    {
      author: "Sarah Johnson",
      content: "Our coding club hackathon was a blast! 🚀 We had 15 teams working on innovative projects. The winner built an AI-powered study assistant. Proud of everyone's hard work! 💻",
      imageUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop",
    },
    {
      author: "Mike Rodriguez",
      content: "Photography club outing to the botanical gardens today 📸 The lighting was perfect and everyone captured some stunning shots. Nature never ceases to amaze!",
      imageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop",
    },
    {
      author: "Emma Davis",
      content: "Dance club performance tonight was electric! 💃 The energy from the audience was incredible. Grateful for such an amazing team and supportive community. ✨",
      imageUrl: "https://images.unsplash.com/photo-1504609773096-104ff2e818cf?w=800&h=600&fit=crop",
    },
    {
      author: "David Kim",
      content: "Just wrapped up our first chess tournament of the semester ♟️ Intense matches and great sportsmanship all around. The winner showed incredible strategic thinking!",
      imageUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&h=600&fit=crop",
    },
    {
      author: "Lisa Wang",
      content: "Art club exhibition opening was a success! 🎨 So proud of all the pieces our members created. From digital illustrations to traditional paintings, the talent is incredible.",
      imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop",
    },
    {
      author: "James Wilson",
      content: "Basketball game against rival school was intense! 🏀 Final score: 78-72. Great team effort and sportsmanship. Looking forward to the next match!",
      imageUrl: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&h=600&fit=crop",
    },
    {
      author: "Anna Martinez",
      content: "Science fair winners announced! 🧪 Our club's projects took home 3 first places. From sustainable energy solutions to medical innovations, the future looks bright! 🔬",
      imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop",
    }
  ]

  for (const post of posts) {
    await prisma.post.create({
      data: post,
    })
    console.log(`Created post by: ${post.author}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })