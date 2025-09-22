import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useLocalStorage } from './useLocalStorage'
import { ChatSession, Message } from '../types'

export function useChatSessions() {
  const { sessions, dispatch, currentSession } = useApp()
  const [storedSessions, setStoredSessions] = useLocalStorage<ChatSession[]>('chatmbm-sessions', [])
  const hasHydratedRef = useRef(false)

  const reviveDates = (rawSessions: ChatSession[]): ChatSession[] => {
    return rawSessions.map((session) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: (session.messages || []).map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }))
  }

  // Load sessions from localStorage ONCE on mount
  useEffect(() => {
    if (hasHydratedRef.current) return
    hasHydratedRef.current = true

    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('chatmbm-sessions') : null
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw)
        const revived = reviveDates(parsed)
        dispatch({ type: 'SET_SESSIONS', payload: revived })

        if (!currentSession) {
          const mostRecent = [...revived].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]
          if (mostRecent) {
            dispatch({ type: 'SET_CURRENT_SESSION', payload: mostRecent })
          }
        }
      }
    } catch (_) {
      // ignore hydration errors
    }
  }, [dispatch, currentSession])

  // Save sessions to localStorage whenever sessions change (including empty array)
  useEffect(() => {
    if (!hasHydratedRef.current) return
    setStoredSessions(sessions)
  }, [sessions, setStoredSessions])

  return { sessions, storedSessions }
}
