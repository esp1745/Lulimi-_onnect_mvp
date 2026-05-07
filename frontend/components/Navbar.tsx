'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import NotificationsDropdown from '@/components/NotificationsDropdown'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <header className="border-b px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
      <Link href="/" className="text-xl font-bold text-emerald-700">Lulimi Connect</Link>
      <nav className="flex items-center gap-4">
        <Link href="/marketplace" className="text-sm text-gray-600 hover:text-emerald-700">Marketplace</Link>
        {user ? (
          <>
            <Link href={user.role === 'teacher' ? '/teacher/dashboard' : '/learner/dashboard'}>
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Badge variant="outline" className="text-xs capitalize">{user.role}</Badge>
            <NotificationsDropdown />
            <Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button>
          </>
        ) : (
          <>
            <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link href="/register"><Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">Sign up</Button></Link>
          </>
        )}
      </nav>
    </header>
  )
}
