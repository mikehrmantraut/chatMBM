import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Image as ImageIcon, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useOpenRouter } from '../../hooks/useOpenRouter'
import { useTelemetry } from '../../hooks/useTelemetry'
import { Message } from '../../types'

export default function ChatInterface() {
  const { currentSession, dispatch, selectedModel, availableModels } = useApp()
  const { sendMessage, isLoadingMessage } = useOpenRouter()
  const { traceAsync, addEvent } = useTelemetry()
  const [inputMessage, setInputMessage] = useState('')
  const [streamingMessage, setStreamingMessage] = useState('')
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null)
  const streamingBufferRef = useRef('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const selectedModelData = availableModels.find(m => m.id === selectedModel)
  const modelSupportsVision = Boolean(selectedModelData?.supportsVision)

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || !selectedModel || isLoadingMessage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date(),
      model: selectedModel,
      imageUrl: modelSupportsVision ? attachedImageUrl ?? undefined : undefined,
    }

    // Track user interaction
    addEvent('chat.message.sent', 'User sent message', {
      'chat.session_id': currentSession.id,
      'chat.model': selectedModel,
      'chat.message_length': userMessage.content.length,
    })

    // Add user message
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { sessionId: currentSession.id, message: userMessage },
    })

    // Set session title from the first user prompt if needed
    const shouldSetTitle = !currentSession.title || currentSession.title === 'Yeni Sohbet'
    if (shouldSetTitle) {
      const firstLine = userMessage.content.split('\n')[0]
      const maxLen = 80
      const title = firstLine.length > maxLen ? firstLine.slice(0, maxLen).trim() + '…' : firstLine
      dispatch({
        type: 'UPDATE_SESSION_TITLE',
        payload: { sessionId: currentSession.id, title },
      })
    }

    setInputMessage('')
    setStreamingMessage('')
    streamingBufferRef.current = ''
    setAttachedImageUrl(null)

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

      // Send message with streaming and tracing
      await traceAsync(
        'chat.message.process',
        async () => {
          return await sendMessage(
            [...currentSession.messages, userMessage],
            selectedModel,
            (chunk: string) => {
              streamingBufferRef.current += chunk
              setStreamingMessage(prev => prev + chunk)
            }
          )
        },
        {
          'chat.session_id': currentSession.id,
          'chat.model': selectedModel,
          'chat.messages_count': currentSession.messages.length + 1,
        }
      )

      // Update the AI message with final content
      const finalAiMessage: Message = {
        ...aiMessage,
        content: streamingBufferRef.current,
      }

      // Replace placeholder with final message
      dispatch({
        type: 'DELETE_MESSAGE',
        payload: { sessionId: currentSession.id, messageId: aiMessageId },
      })
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { sessionId: currentSession.id, message: finalAiMessage },
      })

      // Track successful response
      addEvent('chat.message.received', 'AI response received', {
        'chat.session_id': currentSession.id,
        'chat.model': selectedModel,
        'chat.response_length': streamingMessage.length,
      })

      // Clear streaming UI
      setStreamingMessage('')
      streamingBufferRef.current = ''

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
          <h3 className="text-lg font-medium text-primary-800 mb-2">Sohbet Başlatın</h3>
          <p className="text-primary-500">Yeni bir sohbet oturumu başlatmak için aşağıdaki butona tıklayın.</p>
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
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-100 text-primary-800 border border-primary-200'
              }`}
            >
              {message.imageUrl && (
                <div className="mb-2">
                  <img src={message.imageUrl} alt="Yüklenen görsel" className="rounded-lg max-h-56 object-contain" />
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString('tr-TR')}
              </p>
            </div>
          </div>
        ))}
          {streamingMessage && (
            <div className="flex justify-start">
              <div className="bg-primary-100 text-primary-800 max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm border border-primary-200">
                <p className="text-sm whitespace-pre-wrap">{streamingMessage}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-primary-600">Yazıyor...</span>
                </div>
              </div>
            </div>
          )}
        {isLoadingMessage && !streamingMessage && (
          <div className="flex justify-start">
            <div className="bg-primary-100 text-primary-800 max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm border border-primary-200">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                <span className="text-sm">AI düşünüyor...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-primary-200 bg-white/40 backdrop-blur-sm p-4">
        <div className="flex items-start space-x-3">
          {modelSupportsVision && (
            <div className="flex items-center">
              <label className={`inline-flex items-center justify-center w-11 h-11 rounded-xl border border-primary-200 bg-white/80 text-primary-700 hover:bg-primary-50 transition cursor-pointer ${isLoadingMessage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isLoadingMessage}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      const result = typeof reader.result === 'string' ? reader.result : null
                      setAttachedImageUrl(result)
                    }
                    reader.readAsDataURL(file)
                  }}
                />
                <ImageIcon className="h-5 w-5" />
              </label>
            </div>
          )}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mesajınızı yazın..."
            className="flex-1 px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 text-primary-800 placeholder-primary-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoadingMessage}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoadingMessage}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {modelSupportsVision && attachedImageUrl && (
          <div className="mt-3 flex items-center space-x-3">
            <div className="relative">
              <img src={attachedImageUrl} alt="Önizleme" className="h-16 w-16 object-cover rounded-lg border border-primary-200" />
              <button
                onClick={() => setAttachedImageUrl(null)}
                className="absolute -top-2 -right-2 bg-white border border-primary-200 rounded-full p-1 shadow"
                aria-label="Görseli kaldır"
              >
                <X className="h-3 w-3 text-primary-700" />
              </button>
            </div>
            <span className="text-xs text-primary-600">Bu görsel mesajla birlikte gönderilecek.</span>
          </div>
        )}
      </div>
    </div>
  )
}
