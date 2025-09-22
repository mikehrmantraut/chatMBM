export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  model?: string
  imageUrl?: string
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  model: string
  createdAt: Date
  updatedAt: Date
}

export interface AIModel {
  id: string
  name: string
  description: string
  context_length: number
  pricing: {
    prompt: string
    completion: string
  }
  isFree: boolean
  supportsVision?: boolean
}

export interface OpenRouterResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AppState {
  currentSession: ChatSession | null
  sessions: ChatSession[]
  availableModels: AIModel[]
  selectedModel: string
  isLoading: boolean
  error: string | null
}
