-- ============================================================
-- ClubHub — Indian University Seed Data
-- Run: npx prisma db execute --file=./seed-indian-university.sql
-- ============================================================

-- ── 1. CLEAR EXISTING DEMO DATA ─────────────────────────────
DELETE FROM Post;
DELETE FROM EventAttendee;
DELETE FROM ClubEvent;
DELETE FROM Event;
DELETE FROM JoinRequest;
DELETE FROM ClubMember WHERE username != 'lakshya_dev';
DELETE FROM Club;
DELETE FROM Member WHERE username NOT IN ('lakshya_dev');

-- ── 2. MEMBERS ───────────────────────────────────────────────
-- Demo accounts (keep existing ones + add new)
INSERT OR IGNORE INTO Member (id, username, email, role, isActive, joinDate) VALUES
  (lower(hex(randomblob(8))), 'student_demo',  'student@vitbhopal.ac.in',  'student', 1, datetime('now')),
  (lower(hex(randomblob(8))), 'member_demo',   'member@vitbhopal.ac.in',   'member',  1, datetime('now')),
  (lower(hex(randomblob(8))), 'leader_demo',   'leader@vitbhopal.ac.in',   'leader',  1, datetime('now')),
  (lower(hex(randomblob(8))), 'faculty_demo',  'faculty@vitbhopal.ac.in',  'faculty', 1, datetime('now'));

-- 5 extra students
INSERT OR IGNORE INTO Member (id, username, email, role, isActive, joinDate) VALUES
  (lower(hex(randomblob(8))), 'arjun_sharma',    'arjun.sharma@vitbhopal.ac.in',    'student', 1, datetime('now')),
  (lower(hex(randomblob(8))), 'priya_verma',     'priya.verma@vitbhopal.ac.in',     'student', 1, datetime('now')),
  (lower(hex(randomblob(8))), 'rohan_gupta',     'rohan.gupta@vitbhopal.ac.in',     'student', 1, datetime('now')),
  (lower(hex(randomblob(8))), 'sneha_patel',     'sneha.patel@vitbhopal.ac.in',     'student', 1, datetime('now')),
  (lower(hex(randomblob(8))), 'karan_singh',     'karan.singh@vitbhopal.ac.in',     'student', 1, datetime('now'));

-- 5 extra members
INSERT OR IGNORE INTO Member (id, username, email, role, isActive, joinDate) VALUES
  (lower(hex(randomblob(8))), 'ananya_iyer',     'ananya.iyer@vitbhopal.ac.in',     'member',  1, datetime('now')),
  (lower(hex(randomblob(8))), 'vikram_nair',     'vikram.nair@vitbhopal.ac.in',     'member',  1, datetime('now')),
  (lower(hex(randomblob(8))), 'divya_mishra',    'divya.mishra@vitbhopal.ac.in',    'member',  1, datetime('now')),
  (lower(hex(randomblob(8))), 'rahul_joshi',     'rahul.joshi@vitbhopal.ac.in',     'member',  1, datetime('now')),
  (lower(hex(randomblob(8))), 'pooja_reddy',     'pooja.reddy@vitbhopal.ac.in',     'member',  1, datetime('now'));

-- 5 extra leaders
INSERT OR IGNORE INTO Member (id, username, email, role, isActive, joinDate) VALUES
  (lower(hex(randomblob(8))), 'aditya_kumar',    'aditya.kumar@vitbhopal.ac.in',    'leader',  1, datetime('now')),
  (lower(hex(randomblob(8))), 'meera_pillai',    'meera.pillai@vitbhopal.ac.in',    'leader',  1, datetime('now')),
  (lower(hex(randomblob(8))), 'nikhil_rao',      'nikhil.rao@vitbhopal.ac.in',      'leader',  1, datetime('now')),
  (lower(hex(randomblob(8))), 'shreya_bose',     'shreya.bose@vitbhopal.ac.in',     'leader',  1, datetime('now')),
  (lower(hex(randomblob(8))), 'tanvir_khan',     'tanvir.khan@vitbhopal.ac.in',     'leader',  1, datetime('now'));

-- 5 extra faculty
INSERT OR IGNORE INTO Member (id, username, email, role, isActive, joinDate) VALUES
  (lower(hex(randomblob(8))), 'dr_sharma',       'r.sharma@vitbhopal.ac.in',        'faculty', 1, datetime('now')),
  (lower(hex(randomblob(8))), 'prof_mehta',      'n.mehta@vitbhopal.ac.in',         'faculty', 1, datetime('now')),
  (lower(hex(randomblob(8))), 'dr_krishnan',     's.krishnan@vitbhopal.ac.in',      'faculty', 1, datetime('now')),
  (lower(hex(randomblob(8))), 'prof_agarwal',    'p.agarwal@vitbhopal.ac.in',       'faculty', 1, datetime('now')),
  (lower(hex(randomblob(8))), 'dr_banerjee',     'a.banerjee@vitbhopal.ac.in',      'faculty', 1, datetime('now'));

-- ── 3. CLUBS ─────────────────────────────────────────────────
INSERT INTO Club (id, name, description, domain, createdBy, createdAt) VALUES
  ('club-tech-001',     'CodeCraft Society',        'Where algorithms meet innovation. We build, break, and learn together through competitive programming, hackathons, and open source contributions.', 'tech',     'leader_demo',  datetime('now')),
  ('club-sports-001',   'VIT Khelkud Club',         'Promoting sportsmanship and physical fitness at VIT Bhopal. We organize inter-college tournaments in cricket, football, and athletics.', 'sports',   'aditya_kumar', datetime('now')),
  ('club-cultural-001', 'Rang Manch',               'The cultural heartbeat of VIT Bhopal. Dance, drama, music, and art — we celebrate the rich tapestry of Indian culture through vibrant performances.', 'cultural', 'meera_pillai', datetime('now')),
  ('club-science-001',  'Antariksh Space Club',     'Exploring the cosmos from Bhopal! From rocketry to astrophotography, we are VIT Bhopal''s gateway to space science and ISRO collaborations.', 'science',  'nikhil_rao',   datetime('now')),
  ('club-music-001',    'Swarangi Music Club',      'The soul of VIT Bhopal sings here. Classical ragas, Bollywood covers, indie originals — all genres welcome. Regular jam sessions and annual Swarotsav fest.', 'music',    'shreya_bose',  datetime('now')),
  ('club-arts-001',     'Canvas Art Society',       'Bringing colours to campus life. Painting, digital art, photography, and street art. We believe every wall is a canvas and every student an artist.', 'arts',     'tanvir_khan',  datetime('now'));

-- ── 4. CLUB MEMBERS ──────────────────────────────────────────
-- CodeCraft Society
INSERT INTO ClubMember (id, clubId, username, role, joinedAt) VALUES
  (lower(hex(randomblob(8))), 'club-tech-001', 'leader_demo',   'president', datetime('now')),
  (lower(hex(randomblob(8))), 'club-tech-001', 'arjun_sharma',  'officer',   datetime('now')),
  (lower(hex(randomblob(8))), 'club-tech-001', 'vikram_nair',   'member',    datetime('now')),
  (lower(hex(randomblob(8))), 'club-tech-001', 'rahul_joshi',   'member',    datetime('now')),
  (lower(hex(randomblob(8))), 'club-tech-001', 'member_demo',   'member',    datetime('now')),
  (lower(hex(randomblob(8))), 'club-tech-001', 'rohan_gupta',   'member',    datetime('now'));

-- VIT Khelkud Club
INSERT INTO ClubMember (id, clubId, username, role, joinedAt) VALUES
  (lower(hex(randomblob(8))), 'club-sports-001', 'aditya_kumar',  'president', datetime('now')),
  (lower(hex(randomblob(8))), 'club-sports-001', 'karan_singh',   'officer',   datetime('now')),
  (lower(hex(randomblob(8))), 'club-sports-001', 'rohan_gupta',   'member',    datetime('now')),
  (lower(hex(randomblob(8))), 'club-sports-001', 'rahul_joshi',   'member',    datetime('now')),
  (lower(hex(randomblob(8))), 'club-sports-001', 'ananya_iyer',   'member',    datetime('now'));

-- Rang Manch
INSERT INTO ClubMember (id, clubId, username, role, joinedAt) VALUES
  (lower(hex(randomblob(8))), 'club-cultural-001', 'meera_pillai',  'president', datetime('now')),
  (lower(hex(randomblob(8))), 'club-cultural-001', 'priya_verma',   'officer',   datetime('now')),
  (lower(hex(randomblob(8))), 'club-cultural-001', 'divya_mishra',  'member',    datetime('now')),
  (lower(hex(randomblob(8))), 'club-cultural-001', 'sneha_patel',   'member',    datetime('now')),
  (lower(hex(randomblob(8))), 'club-cultural-001', 'pooja_reddy',   'member',    datetime('now'));

-- Antariksh Space Club
INSERT INTO ClubMember (id, clubId, username, role, joinedAt) VALUES
  (lower(hex(randomblob(8))), 'club-science-001', 'nikhil_rao',    'president', datetime('now')),
  (lower(hex(randomblob(8))), 'club-science-001', 'arjun_sharma',  'officer',   datetime('now')),
  (lower(hex(randomblob(8))), 'club-science-001', 'vikram_nair',   'member',    datetime('now')),
  (lower(hex(randomblob(8))), 'club-science-001', 'karan_singh',   'member',    datetime('now'));

-- Swarangi Music Club
INSERT INTO ClubMember (id, clubId, username, role, joinedAt) VALUES
  (lower(hex(randomblob(8))), 'club-music-001', 'shreya_bose',   'president', datetime('now')),
  (lower(hex(randomblob(8))), 'club-music-001', 'priya_verma',   'officer',   datetime('now')),
  (lower(hex(randomblob(8))), 'club-music-001', 'divya_mishra',  'member',    datetime('now')),
  (lower(hex(randomblob(8))), 'club-music-001', 'sneha_patel',   'member',    datetime('now')),
  (lower(hex(randomblob(8))), 'club-music-001', 'ananya_iyer',   'member',    datetime('now'));

-- Canvas Art Society
INSERT INTO ClubMember (id, clubId, username, role, joinedAt) VALUES
  (lower(hex(randomblob(8))), 'club-arts-001', 'tanvir_khan',   'president', datetime('now')),
  (lower(hex(randomblob(8))), 'club-arts-001', 'pooja_reddy',   'officer',   datetime('now')),
  (lower(hex(randomblob(8))), 'club-arts-001', 'divya_mishra',  'member',    datetime('now')),
  (lower(hex(randomblob(8))), 'club-arts-001', 'member_demo',   'member',    datetime('now'));

-- ── 5. EVENTS ────────────────────────────────────────────────
INSERT INTO Event (id, title, description, date, time, location, capacity, createdBy, createdAt) VALUES
  ('evt-hack-001',   'HackVIT 2026',                   'VIT Bhopal''s flagship 24-hour hackathon. Build solutions for real Indian problems — healthcare, agriculture, fintech. Prizes worth ₹1,00,000!', '2026-03-25', '09:00', 'AB Block Auditorium',    200, 'leader_demo',  datetime('now')),
  ('evt-cricket-001','Inter-Hostel Cricket Tournament', 'Annual cricket championship between all 8 hostels. Cheer for your hostel team! Finals at the main ground.', '2026-03-22', '08:00', 'VIT Sports Ground',       120, 'aditya_kumar', datetime('now')),
  ('evt-cult-001',   'Rang Utsav — Holi Cultural Fest', 'Celebrate Holi with colours, music, dance and art. Folk performances, rangoli competition, and dhol beats all day long!', '2026-03-14', '10:00', 'Central Lawn, VIT Bhopal', 500, 'meera_pillai', datetime('now')),
  ('evt-space-001',  'Antariksh Stargazing Night',      'Join us for a night under the stars. We''ll observe Jupiter, Saturn and the Orion Nebula through our 8-inch telescope. ISRO scientist guest talk at 8 PM.', '2026-03-28', '19:00', 'VIT Rooftop Observatory',  60, 'nikhil_rao',   datetime('now')),
  ('evt-music-001',  'Swarotsav — Spring Music Night',  'Annual music extravaganza featuring classical, fusion, and indie performances. Open mic in the first half. Special guest: popular indie band from Indore.', '2026-04-05', '18:00', 'Open Air Theatre, VIT',   300, 'shreya_bose',  datetime('now')),
  ('evt-art-001',    'Rang De — Art Exhibition 2026',   'Annual art exhibition showcasing paintings, digital art, sculptures, and photography by VIT students. Chief Guest: renowned Bhopal artist Shri Ramesh Patel.', '2026-04-10', '11:00', 'Gallery Hall, Library Block', 150, 'tanvir_khan', datetime('now')),
  ('evt-cp-001',     'Code Samurai — CP Contest',       'Weekly competitive programming contest on Codeforces-style judge. Ratings updated live. Top performers get CodeCraft hoodies!', '2026-03-20', '14:00', 'Computer Lab 3, IT Block',  80, 'leader_demo',  datetime('now')),
  ('evt-yoga-001',   'International Yoga Day Prep',     'Practice session for International Yoga Day celebration. All students welcome — beginners to advanced. Conducted by Dr. Krishnan.', '2026-04-15', '06:00', 'VIT Sports Lawn',         100, 'aditya_kumar', datetime('now'));

-- ── 6. CLUB EVENTS (linking) ──────────────────────────────────
INSERT INTO ClubEvent (id, clubId, eventId) VALUES
  (lower(hex(randomblob(8))), 'club-tech-001',     'evt-hack-001'),
  (lower(hex(randomblob(8))), 'club-tech-001',     'evt-cp-001'),
  (lower(hex(randomblob(8))), 'club-sports-001',   'evt-cricket-001'),
  (lower(hex(randomblob(8))), 'club-sports-001',   'evt-yoga-001'),
  (lower(hex(randomblob(8))), 'club-cultural-001', 'evt-cult-001'),
  (lower(hex(randomblob(8))), 'club-science-001',  'evt-space-001'),
  (lower(hex(randomblob(8))), 'club-music-001',    'evt-music-001'),
  (lower(hex(randomblob(8))), 'club-arts-001',     'evt-art-001');

-- ── 7. POSTS (feed) ──────────────────────────────────────────
INSERT INTO Post (id, author, content, createdAt) VALUES
  (lower(hex(randomblob(8))), 'arjun_sharma',
   '🚀 Just solved my 300th problem on LeetCode! Hard mode is finally clicking. If anyone wants to practice DP problems together before HackVIT, ping me. #CodeCraft #CompetitiveProgramming',
   datetime('now', '-6 hours')),

  (lower(hex(randomblob(8))), 'meera_pillai',
   '🎭 Rang Manch auditions for Rang Utsav are OPEN! We need dancers, singers, and drama performers. No prior experience needed — just passion and enthusiasm. Register at the Cultural Office by March 18. See you on stage! 🌈',
   datetime('now', '-5 hours')),

  (lower(hex(randomblob(8))), 'nikhil_rao',
   '🔭 Exciting news! Antariksh Space Club has received a new 8-inch Dobsonian telescope funded by the Science Department. Our first stargazing session is on March 28. Jupiter and Saturn are perfectly positioned this month. Join us! 🪐✨',
   datetime('now', '-4 hours')),

  (lower(hex(randomblob(8))), 'priya_verma',
   '🎵 Rehearsal for Swarotsav going amazingly well! Our fusion piece blending classical Hindustani with electronic beats is coming together beautifully. Cannot wait for April 5th! 🎶 #Swarangi',
   datetime('now', '-3 hours')),

  (lower(hex(randomblob(8))), 'leader_demo',
   '💻 HackVIT 2026 registrations are now OPEN! Theme: "Tech for Bharat" — solve real problems faced by Indian communities. 24 hours, ₹1 lakh in prizes, free food, and amazing goodies. Register at hackvit.vitbhopal.ac.in 🔥 #HackVIT2026',
   datetime('now', '-2 hours')),

  (lower(hex(randomblob(8))), 'karan_singh',
   '🏏 Inter-Hostel Cricket Tournament draw is out! Saraswati Hostel vs Tagore Hostel in the first match on March 22. Come support your hostel! Free entry for all VIT students. Snacks at the ground 🏟️ #VITKhelkud',
   datetime('now', '-90 minutes')),

  (lower(hex(randomblob(8))), 'divya_mishra',
   '🎨 Working on my entry for Rang De Art Exhibition! Oil on canvas — a modern take on the Bhopal Gas Tragedy memorial. Art is memory. Exhibition on April 10 at Library Block. Come see works by 40+ VIT artists 🖌️',
   datetime('now', '-75 minutes')),

  (lower(hex(randomblob(8))), 'shreya_bose',
   '🎤 Open mic slots for Swarotsav are filling up fast! We still have 5 slots left for solos. Any genre — classical, ghazal, pop, rap, anything! DM me or visit Room 204 MB Block. Deadline: March 25 🎸',
   datetime('now', '-60 minutes')),

  (lower(hex(randomblob(8))), 'vikram_nair',
   'Just attended the CodeCraft weekly session on Graph Theory. Dijkstra and Bellman-Ford finally make sense after Arjun bhai explained it with a map of Bhopal 😂 The club meetings are genuinely helpful. Next session: Dynamic Programming on Saturday 4 PM',
   datetime('now', '-45 minutes')),

  (lower(hex(randomblob(8))), 'ananya_iyer',
   '🌺 Rang Utsav is going to be massive this year! We are planning a 50-person flash mob at the Central Lawn at 12 PM on Holi. Practice sessions daily at 7 PM in the Dance Studio. ALL are welcome regardless of dance experience! #RangManch #Holi2026',
   datetime('now', '-30 minutes')),

  (lower(hex(randomblob(8))), 'rahul_joshi',
   'PSA for all first-year students: VIT Bhopal clubs are the best way to make friends and build your portfolio. I joined CodeCraft and Khelkud in first year and honestly it changed my entire college experience. Go join something today! 🙌',
   datetime('now', '-20 minutes')),

  (lower(hex(randomblob(8))), 'sneha_patel',
   '📸 Candid shots from yesterday''s Rang Manch rehearsal are up on the Cultural Club notice board! Also working on a photo essay about college life at VIT Bhopal for the Canvas Art Society exhibition. Photography is storytelling 📷 #CanvasArtSociety',
   datetime('now', '-15 minutes')),

  (lower(hex(randomblob(8))), 'tanvir_khan',
   '🖼️ Canvas Art Society is accepting submissions for Rang De exhibition until April 1st. Any medium — oil, watercolour, digital, sculpture, photography. Theme: "New India, Ancient Roots". Best works get displayed permanently in the Admin Block. Apply on the club portal!',
   datetime('now', '-10 minutes')),

  (lower(hex(randomblob(8))), 'pooja_reddy',
   'Final year and still discovering new things about VIT Bhopal! Just found out the Swarangi Music Club has a full recording studio in AB Block basement 🎙️ Recorded my first original song there last night. College has been too good 😭❤️',
   datetime('now', '-5 minutes')),

  (lower(hex(randomblob(8))), 'aditya_kumar',
   '⚽ Football tryouts for the inter-college Khelo India league are this Saturday 7 AM at the sports ground. VIT Bhopal is participating for the first time! We need 18 players. Bring your boots and your A-game 💪 #VITKhelkud #KheloIndia',
   datetime('now', '-2 minutes'));

-- ── 8. ANNOUNCEMENTS ─────────────────────────────────────────
INSERT INTO Announcement (id, title, content, author, clubId, createdAt) VALUES
  (lower(hex(randomblob(8))), 'HackVIT 2026 Registrations Open!',
   'Team registrations for HackVIT 2026 are now live. Theme: Tech for Bharat. Maximum team size: 4. Last date to register: March 23, 2026. Contact leader_demo or visit the CodeCraft notice board.',
   'leader_demo', 'club-tech-001', datetime('now', '-3 hours')),

  (lower(hex(randomblob(8))), 'Rang Utsav Auditions — All Are Welcome',
   'Rang Manch is holding open auditions for Rang Utsav on March 18 at 5 PM in the Open Air Theatre. We need performers for dance, drama, and music segments. No experience required!',
   'meera_pillai', 'club-cultural-001', datetime('now', '-2 hours')),

  (lower(hex(randomblob(8))), 'New Telescope Arrived — Stargazing Session Announced',
   'Antariksh Space Club has received a brand new 8-inch Dobsonian telescope. Our inaugural stargazing night is March 28 at 7 PM on the VIT Rooftop. Limited to 60 participants — register early!',
   'nikhil_rao', 'club-science-001', datetime('now', '-1 hour')),

  (lower(hex(randomblob(8))), 'Swarotsav Open Mic Slots Available',
   'Swarangi Music Club is accepting open mic registrations for Swarotsav on April 5. 5 solo slots remaining. Any genre welcome. Contact Shreya or visit Room 204 MB Block.',
   'shreya_bose', 'club-music-001', datetime('now', '-30 minutes'));
