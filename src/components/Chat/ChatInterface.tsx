import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useOpenRouter } from '../../hooks/useOpenRouter'
import { Message } from '../../types'

export default function ChatInterface() {
  const { currentSession, dispatch, selectedModel } = useApp()
  const { sendMessage, isLoadingMessage } = useOpenRouter()
  const [inputMessage, setInputMessage] = useState('')
  const [streamingMessage, setStreamingMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || !selectedModel || isLoadingMessage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date(),
      model: selectedModel,
    }

    // Add user message
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { sessionId: currentSession.id, message: userMessage },
    })

    setInputMessage('')
    setStreamingMessage('')

    // Create AI message placeholder
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      model: selectedModel,
    }

    try {

      // Add empty AI message first
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { sessionId: currentSession.id, message: aiMessage },
      })

      // Send message with streaming
      await sendMessage(
        [...currentSession.messages, userMessage],
        selectedModel,
        (chunk: string) => {
          setStreamingMessage(prev => prev + chunk)
        }
      )

      // Update the AI message with final content
      const finalAiMessage: Message = {
        ...aiMessage,
        content: streamingMessage,
      }

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { sessionId: currentSession.id, message: finalAiMessage },
      })

    } catch (error) {
      console.error('Error sending message:', error)
      // Remove the empty AI message on error
      dispatch({
        type: 'DELETE_MESSAGE',
        payload: { sessionId: currentSession.id, messageId: aiMessageId },
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sohbet Başlatın</h3>
          <p className="text-gray-500">Yeni bir sohbet oturumu başlatmak için aşağıdaki butona tıklayın.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentSession.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString('tr-TR')}
              </p>
            </div>
          </div>
        ))}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{streamingMessage}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <span className="text-xs opacity-70">Yazıyor...</span>
              </div>
            </div>
          </div>
        )}
        {isLoadingMessage && !streamingMessage && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI düşünüyor...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mesajınızı yazın..."
            className="flex-1 input-field"
            disabled={isLoadingMessage}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoadingMessage}
            className="btn-primary flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
