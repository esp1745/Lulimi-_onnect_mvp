'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'
import { Teacher } from '@/types'

function MarketplaceContent() {
  const params = useSearchParams()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [search, setSearch] = useState(params.get('language') || '')
  const [format, setFormat] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchTeachers = async (lang: string, fmt: string) => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (lang) q.set('language', lang)
      if (fmt) q.set('format', fmt)
      const { data } = await api.get(`/api/teachers/marketplace/?${q}`)
      setTeachers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTeachers(search, format) }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTeachers(search, format)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-6 py-10 flex-1">
        <h1 className="text-3xl font-bold mb-2">Find a teacher</h1>
        <p className="text-gray-500 mb-8">Search by language, format, or browse all teachers.</p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
          <Input
            placeholder="Search language (e.g. Yoruba, Swahili…)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm text-gray-700 bg-white"
          >
            <option value="">Any format</option>
            <option value="online">Online</option>
            <option value="in_person">In person</option>
            <option value="both">Both</option>
          </select>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Search</Button>
        </form>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading teachers…</div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No teachers found.</p>
            <p className="text-gray-400 text-sm">Try a different language or clear the filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {teachers.map((t) => (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <Avatar className="h-14 w-14 shrink-0">
                      <AvatarImage src={t.profile_photo_url} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-semibold">
                        {t.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-base">{t.full_name}</h3>
                          <p className="text-sm text-gray-500">{t.country}</p>
                        </div>
                        {t.is_featured && <Badge className="bg-amber-100 text-amber-700 border-0 shrink-0">Featured</Badge>}
                      </div>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">{t.headline}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.languages.map((l) => (
                          <Badge key={l.id} variant="outline" className="text-xs">{l.language_name}</Badge>
                        ))}
                        <Badge variant="outline" className="text-xs capitalize">{t.lesson_format?.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/teachers/${t.id}`}>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">View profile</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  return <Suspense><MarketplaceContent /></Suspense>
}
