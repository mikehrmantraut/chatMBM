import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useLocalStorage } from './useLocalStorage'
import { ChatSession } from '../types'

export function useChatSessions() {
  const { sessions, dispatch } = useApp()
  const [storedSessions, setStoredSessions] = useLocalStorage<ChatSession[]>('chatmbm-sessions', [])

  // Load sessions from localStorage on mount
  useEffect(() => {
    if (storedSessions.length > 0) {
      dispatch({ type: 'SET_SESSIONS', payload: storedSessions })
    }
  }, [dispatch, storedSessions])

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      setStoredSessions(sessions)
    }
  }, [sessions, setStoredSessions])

  return { sessions, storedSessions }
}
