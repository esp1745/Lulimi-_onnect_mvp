'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import api from '@/lib/api'
import { Teacher } from '@/types'

const LANGUAGES = ['Bemba', 'Nyanja', 'Tonga', 'Lozi', 'Kaonde', 'Luvale', 'Lunda', 'Tumbuka']

export default function LandingPage() {
  const [featured, setFeatured] = useState<Teacher[]>([])

  useEffect(() => {
    api.get('/api/teachers/?featured=true').then((r) => setFeatured(r.data.slice(0, 6))).catch(() => {})
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-emerald-700">Lulimi Connect</span>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20 bg-gradient-to-b from-emerald-50 to-white">
        <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-0">African language learning</Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl">
          Learn an African language with a{' '}
          <span className="text-emerald-600">real teacher</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mb-10">
          Find expert teachers for Bemba, Nyanja, Tonga, Lozi and more. Book lessons, access resources, and connect with Zambia's languages and culture.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/marketplace">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
              Find a teacher
            </Button>
          </Link>
          <Link href="/register?role=teacher">
            <Button size="lg" variant="outline" className="px-8 border-emerald-600 text-emerald-700">
              Apply as a teacher
            </Button>
          </Link>
        </div>
      </section>

      {/* Language tags */}
      <section className="px-6 py-12 flex flex-col items-center">
        <p className="text-sm text-gray-400 uppercase tracking-widest mb-6">Languages available</p>
        <div className="flex flex-wrap justify-center gap-3">
          {LANGUAGES.map((lang) => (
            <Link key={lang} href={`/marketplace?language=${lang}`}>
              <Badge
                variant="outline"
                className="text-sm px-4 py-2 cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-colors"
              >
                {lang}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured teachers */}
      {featured.length > 0 && (
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Featured teachers</h2>
              <Link href="/marketplace" className="text-sm text-emerald-600 hover:underline">View all →</Link>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {featured.map((t) => (
                <Link key={t.id} href={`/teachers/${t.id}`}>
                  <div className="border rounded-xl p-5 bg-white hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={t.profile_photo_url} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                          {t.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{t.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{t.country}</p>
                      </div>
                    </div>
                    {t.headline && <p className="text-xs text-gray-600 line-clamp-2">{t.headline}</p>}
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {t.languages.slice(0, 3).map((l) => (
                        <Badge key={l.id} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          {l.language_name}
                        </Badge>
                      ))}
                      {t.pricing_info && (
                        <Badge variant="outline" className="text-xs ml-auto">{t.pricing_info}</Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="px-6 py-16 bg-gray-50">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Find your teacher', desc: 'Search by language, lesson format, and availability.' },
            { step: '2', title: 'Book a lesson', desc: 'Request a time slot that works for you. Teacher confirms within 24 hours.' },
            { step: '3', title: 'Start learning', desc: 'Join via Zoom, WhatsApp, or in person. Access resources anytime.' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-bold mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start?</h2>
        <p className="text-gray-500 mb-8">Join teachers and learners already on Lulimi Connect.</p>
        <Link href="/register">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10">
            Create free account
          </Button>
        </Link>
      </section>

      <footer className="border-t px-6 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Lulimi Connect. Zambian language teachers and learners.
      </footer>
    </div>
  )
}
