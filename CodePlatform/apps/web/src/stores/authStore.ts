import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  setSession: (token: string, user: User) => void
  clearSession: () => void
}

const storedToken = localStorage.getItem('codequest.token')
const storedUser = localStorage.getItem('codequest.user')

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  setSession: (token, user) => {
    localStorage.setItem('codequest.token', token)
    localStorage.setItem('codequest.user', JSON.stringify(user))
    set({ token, user })
  },
  clearSession: () => {
    localStorage.removeItem('codequest.token')
    localStorage.removeItem('codequest.user')
    set({ token: null, user: null })
  },
}))
