import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const LANGUAGES = ['Yoruba', 'Swahili', 'Akan', 'Kinyarwanda', 'Amharic', 'Zulu', 'Igbo', 'Twi']

export default function LandingPage() {
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
          Find expert teachers for Yoruba, Swahili, Akan, Kinyarwanda and more. Book lessons, access resources, and connect with your roots.
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
        © {new Date().getFullYear()} Lulimi Connect. African language teachers and learners.
      </footer>
    </div>
  )
}
