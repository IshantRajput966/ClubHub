// lib/hooks/use-auto-image.ts
// Builds a direct Unsplash URL in the browser - no API call needed

import { useState, useEffect } from "react"

// Curated Unsplash photo IDs per domain - guaranteed to exist and load fast
const DOMAIN_PHOTOS: Record<string, string[]> = {
  tech: [
    "photo-1504384308090-c894fdcc538d",
    "photo-1461749280684-dccba630e2f6",
    "photo-1519389950473-47ba0277781c",
    "photo-1573164713988-8665fc963095",
    "photo-1498050108023-c5249f4df085",
  ],
  sports: [
    "photo-1540747913346-19e32dc3e97e",
    "photo-1546519638-68e109498ffc",
    "photo-1593341646782-e0b495cff86d",
    "photo-1517649763962-0c623066013b",
    "photo-1574629810360-7efbbe195018",
  ],
  cultural: [
    "photo-1587474260584-136574528ed5",
    "photo-1532375810709-75b1da00537c",
    "photo-1567591370430-7374e5e1e5f2",
    "photo-1524492412937-b28074a5d7da",
    "photo-1605296867304-46d5465a13f1",
  ],
  science: [
    "photo-1419242902214-272b3f66ee7a",
    "photo-1446776811953-b23d57bd21aa",
    "photo-1532094349884-543290ba8f01",
    "photo-1581091226825-a6a2a5aee158",
    "photo-1564325724739-bae0bd08762c",
  ],
  music: [
    "photo-1511671782779-c97d3d27a1d4",
    "photo-1493225457124-a3eb161ffa5f",
    "photo-1514525253161-7a46d19cd819",
    "photo-1598488035139-bdbb2231ce04",
    "photo-1508700115892-45ecd05ae2ad",
  ],
  arts: [
    "photo-1541961017774-22349e4a1262",
    "photo-1460661419201-fd4cecdf8a8b",
    "photo-1513364776144-60967b0f800f",
    "photo-1485546246426-74dc88dec4d9",
    "photo-1578926375605-eaf7559b1458",
  ],
  other: [
    "photo-1523050854058-8df90110c9f1",
    "photo-1607237138185-eedd9c632b0b",
    "photo-1562774053-701939374585",
    "photo-1492538368677-f6e0afe31dcc",
    "photo-1541339907198-e08756dedf3f",
  ],
}

function pickPhoto(domain: string, id: string): string {
  const photos = DOMAIN_PHOTOS[domain?.toLowerCase()] ?? DOMAIN_PHOTOS.other
  // Use id hash to pick consistently
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  const photo = photos[hash % photos.length]
  return `https://images.unsplash.com/${photo}?w=800&q=80&fit=crop`
}

export function useAutoImage({
  imageUrl, title, description, domain, id,
}: {
  imageUrl?: string | null
  title: string
  description?: string
  domain?: string
  id: string
}) {
  const fallback = pickPhoto(domain ?? "other", id)
  const [src, setSrc] = useState<string>(imageUrl || fallback)

  useEffect(() => {
    setSrc(imageUrl || pickPhoto(domain ?? "other", id))
  }, [id, imageUrl, domain])

  return { src, loading: false }
}
