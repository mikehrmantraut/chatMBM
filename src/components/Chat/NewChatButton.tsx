import React from 'react'
import { Plus, MessageCircle, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ChatSession, Message } from '../../types'
import { useOpenRouter } from '../../hooks/useOpenRouter'

export default function NewChatButton() {
  const { dispatch, selectedModel, currentSession, availableModels } = useApp()
  const { sendMessage, isLoadingMessage } = useOpenRouter()

  const handleNewChat = () => {
    if (!selectedModel) {
      dispatch({ type: 'SET_ERROR', payload: 'Lütfen önce bir model seçin' })
      return
    }

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Yeni Sohbet',
      messages: [],
      model: selectedModel,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    dispatch({ type: 'CREATE_SESSION', payload: newSession })
  }

  const handleQuickStart = async (prompt: string) => {
    if (!selectedModel) {
      dispatch({ type: 'SET_ERROR', payload: 'Lütfen önce bir model seçin' })
      return
    }

    // Ensure there is an active session and capture its id
    let sessionId = currentSession?.id
    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: 'Yeni Sohbet',
        messages: [],
        model: selectedModel,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      dispatch({ type: 'CREATE_SESSION', payload: newSession })
      sessionId = newSession.id
    }

    const userMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: prompt,
      role: 'user',
      timestamp: new Date(),
      model: selectedModel,
    }
    dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message: userMessage } })

    // Set session title from the first user prompt if needed
    const shouldSetTitle = !currentSession?.title || currentSession?.title === 'Yeni Sohbet'
    if (shouldSetTitle) {
      const firstLine = userMessage.content.split('\n')[0]
      const maxLen = 80
      const title = firstLine.length > maxLen ? firstLine.slice(0, maxLen).trim() + '…' : firstLine
      dispatch({ type: 'UPDATE_SESSION_TITLE', payload: { sessionId, title } })
    }

    // Add AI placeholder
    const aiMessageId = (Date.now() + 2).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      model: selectedModel,
    }
    dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message: aiMessage } })

    try {
      // Call API without streaming for simplicity
      const modelSupportsVision = Boolean(availableModels.find(m => m.id === selectedModel)?.supportsVision)
      const messagesToSend = [userMessage] // Only the new message is sufficient context for a new chat
      const response = await sendMessage(messagesToSend, selectedModel)

      // Replace placeholder with final content
      dispatch({ type: 'DELETE_MESSAGE', payload: { sessionId, messageId: aiMessageId } })
      dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message: { ...aiMessage, content: response } } })
    } catch (e) {
      // Remove placeholder on error
      dispatch({ type: 'DELETE_MESSAGE', payload: { sessionId, messageId: aiMessageId } })
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={handleNewChat}
        className="w-full bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 flex items-center justify-center space-x-2 py-4 shadow-sm font-medium"
      >
        <MessageCircle className="h-5 w-5" />
        <span>Yeni Sohbet Başlat</span>
      </button>
      
      <div className="text-center">
        <div className="text-xs text-primary-600 mb-3 font-medium">Hızlı Başlangıç</div>
        <div className="space-y-2 text-xs text-primary-500">
          <button onClick={() => handleQuickStart('Merhaba, nasılsın?')} className="w-full text-left bg-primary-50 px-3 py-2 rounded-lg border border-primary-200 hover:bg-primary-100 transition">"Merhaba, nasılsın?"</button>
          <button onClick={() => handleQuickStart('Bugün hava nasıl?')} className="w-full text-left bg-primary-50 px-3 py-2 rounded-lg border border-primary-200 hover:bg-primary-100 transition">"Bugün hava nasıl?"</button>
          <button onClick={() => handleQuickStart('Bana bir hikaye anlat')} className="w-full text-left bg-primary-50 px-3 py-2 rounded-lg border border-primary-200 hover:bg-primary-100 transition">"Bana bir hikaye anlat"</button>
        </div>
      </div>
    </div>
  )
}
