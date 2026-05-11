import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  setSession: (token: string, refreshToken: string, user: User) => void
  setAccessToken: (token: string) => void
  clearSession: () => void
}

const storedToken = localStorage.getItem('codequest.token')
const storedRefresh = localStorage.getItem('codequest.refresh')
const storedUser = localStorage.getItem('codequest.user')

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  refreshToken: storedRefresh,
  user: storedUser ? JSON.parse(storedUser) : null,
  setSession: (token, refreshToken, user) => {
    localStorage.setItem('codequest.token', token)
    localStorage.setItem('codequest.refresh', refreshToken)
    localStorage.setItem('codequest.user', JSON.stringify(user))
    set({ token, refreshToken, user })
  },
  setAccessToken: (token) => {
    localStorage.setItem('codequest.token', token)
    set({ token })
  },
  clearSession: () => {
    localStorage.removeItem('codequest.token')
    localStorage.removeItem('codequest.refresh')
    localStorage.removeItem('codequest.user')
    set({ token: null, refreshToken: null, user: null })
  },
}))
