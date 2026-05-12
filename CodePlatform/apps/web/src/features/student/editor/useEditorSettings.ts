import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '../../../api/client'
import type { EditorSettings } from '../../../types'
import { DEFAULT_EDITOR_SETTINGS } from './editorThemes'

const STORAGE_KEY = 'codequest-editor-settings'

function readCached(): EditorSettings {
  if (typeof window === 'undefined') return DEFAULT_EDITOR_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_EDITOR_SETTINGS
    const parsed = JSON.parse(raw) as Partial<EditorSettings>
    return { ...DEFAULT_EDITOR_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_EDITOR_SETTINGS
  }
}

function writeCached(settings: EditorSettings) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore quota or privacy-mode failures — server is the source of truth.
  }
}

export function useEditorSettings() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['editor-settings'],
    queryFn: api.getEditorSettings,
    initialData: readCached(),
    staleTime: 60_000,
  })

  useEffect(() => {
    if (query.data) writeCached(query.data)
  }, [query.data])

  const mutate = useMutation({
    mutationFn: (next: EditorSettings) => api.updateEditorSettings(next),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ['editor-settings'] })
      const previous = queryClient.getQueryData<EditorSettings>(['editor-settings'])
      queryClient.setQueryData(['editor-settings'], next)
      writeCached(next)
      return { previous }
    },
    onError: (_err, _next, context) => {
      if (context?.previous) queryClient.setQueryData(['editor-settings'], context.previous)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['editor-settings'], data)
      writeCached(data)
    },
  })

  return {
    settings: query.data ?? DEFAULT_EDITOR_SETTINGS,
    isLoading: query.isLoading,
    update: (patch: Partial<EditorSettings>) => {
      const next = { ...(query.data ?? DEFAULT_EDITOR_SETTINGS), ...patch }
      mutate.mutate(next)
    },
    reset: () => mutate.mutate(DEFAULT_EDITOR_SETTINGS),
  }
}
