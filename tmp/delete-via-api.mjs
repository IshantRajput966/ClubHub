// Delete SYSTEM posts via the running Next.js API
const ids = [
  'cmnbiyg630002dgi5cyq31onx',
  'cmndhhvm70003k0ezsirs79os'
]

for (const id of ids) {
  const res = await fetch(`http://localhost:3000/api/posts/${id}`, { method: 'DELETE' })
  const body = await res.json().catch(() => ({}))
  console.log(`DELETE ${id} -> ${res.status}`, body)
}
