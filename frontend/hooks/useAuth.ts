'use client'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import api from '@/lib/api'
import { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('access_token')
    if (!token) { setLoading(false); return }
    api.get('/api/auth/me/')
      .then((r) => setUser(r.data))
      .catch(() => { Cookies.remove('access_token'); Cookies.remove('refresh_token') })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/login/', { email, password })
    Cookies.set('access_token', data.access, { expires: 1 })
    Cookies.set('refresh_token', data.refresh, { expires: 7 })
    const me = await api.get('/api/auth/me/')
    setUser(me.data)
    return me.data as User
  }

  const logout = async () => {
    const refresh = Cookies.get('refresh_token')
    if (refresh) await api.post('/api/auth/logout/', { refresh }).catch(() => {})
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    setUser(null)
  }

  return { user, loading, login, logout }
}
