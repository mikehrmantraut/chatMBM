import React from 'react'
import { Plus, MessageCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ChatSession } from '../../types'

export default function NewChatButton() {
  const { dispatch, selectedModel } = useApp()

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

  return (
    <button
      onClick={handleNewChat}
      className="w-full btn-primary flex items-center justify-center space-x-2"
    >
      <Plus className="h-4 w-4" />
      <span>Yeni Sohbet</span>
    </button>
  )
}
