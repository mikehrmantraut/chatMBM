import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { AppState, ChatSession, Message, AIModel } from '../types'

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MODELS'; payload: AIModel[] }
  | { type: 'SET_SELECTED_MODEL'; payload: string }
  | { type: 'SET_SESSIONS'; payload: ChatSession[] }
  | { type: 'SET_CURRENT_SESSION'; payload: ChatSession | null }
  | { type: 'ADD_MESSAGE'; payload: { sessionId: string; message: Message } }
  | { type: 'DELETE_MESSAGE'; payload: { sessionId: string; messageId: string } }
  | { type: 'CREATE_SESSION'; payload: ChatSession }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'UPDATE_SESSION_TITLE'; payload: { sessionId: string; title: string } }

const initialState: AppState = {
  currentSession: null,
  sessions: [],
  availableModels: [],
  selectedModel: '',
  isLoading: false,
  error: null,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_MODELS':
      return { ...state, availableModels: action.payload }
    
    case 'SET_SELECTED_MODEL':
      return { ...state, selectedModel: action.payload }
    
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload }
    
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload }
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.sessionId
            ? {
                ...session,
                messages: [...session.messages, action.payload.message],
                updatedAt: new Date(),
              }
            : session
        ),
        currentSession: state.currentSession?.id === action.payload.sessionId
          ? {
              ...state.currentSession,
              messages: [...state.currentSession.messages, action.payload.message],
              updatedAt: new Date(),
            }
          : state.currentSession,
      }
    
    case 'DELETE_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.sessionId
            ? {
                ...session,
                messages: session.messages.filter(msg => msg.id !== action.payload.messageId),
                updatedAt: new Date(),
              }
            : session
        ),
        currentSession: state.currentSession?.id === action.payload.sessionId
          ? {
              ...state.currentSession,
              messages: state.currentSession.messages.filter(msg => msg.id !== action.payload.messageId),
              updatedAt: new Date(),
            }
          : state.currentSession,
      }
    
    case 'CREATE_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        currentSession: action.payload,
      }
    
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(session => session.id !== action.payload),
        currentSession: state.currentSession?.id === action.payload ? null : state.currentSession,
      }
    
    case 'UPDATE_SESSION_TITLE':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.sessionId
            ? { ...session, title: action.payload.title, updatedAt: new Date() }
            : session
        ),
        currentSession: state.currentSession?.id === action.payload.sessionId
          ? { ...state.currentSession, title: action.payload.title, updatedAt: new Date() }
          : state.currentSession,
      }
    
    default:
      return state
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
