import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.getState().clearSession()
  })

  it('stores token, refresh token and user on setSession', () => {
    useAuthStore.getState().setSession('access', 'refresh', {
      id: 'u1',
      name: 'Ana',
      email: 'ana@x.dev',
      role: 'Student',
    })

    expect(useAuthStore.getState().token).toBe('access')
    expect(useAuthStore.getState().refreshToken).toBe('refresh')
    expect(useAuthStore.getState().user?.name).toBe('Ana')
    expect(localStorage.getItem('codequest.token')).toBe('access')
  })

  it('clears everything on clearSession', () => {
    useAuthStore.getState().setSession('access', 'refresh', {
      id: 'u1',
      name: 'Ana',
      email: 'ana@x.dev',
      role: 'Student',
    })

    useAuthStore.getState().clearSession()

    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
    expect(localStorage.getItem('codequest.token')).toBeNull()
  })

  it('rotates only the access token on setAccessToken', () => {
    useAuthStore.getState().setSession('access', 'refresh', {
      id: 'u1',
      name: 'Ana',
      email: 'ana@x.dev',
      role: 'Student',
    })

    useAuthStore.getState().setAccessToken('new-access')

    expect(useAuthStore.getState().token).toBe('new-access')
    expect(useAuthStore.getState().refreshToken).toBe('refresh')
  })
})
