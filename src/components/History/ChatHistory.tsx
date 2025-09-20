import React from 'react'
import { MessageCircle, Trash2, Calendar } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ChatSession } from '../../types'

export default function ChatHistory() {
  const { sessions, currentSession, dispatch } = useApp()

  const handleSessionSelect = (session: ChatSession) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session })
  }

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Bu sohbet oturumunu silmek istediğinizden emin misiniz?')) {
      dispatch({ type: 'DELETE_SESSION', payload: sessionId })
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz sohbet yok</h3>
        <p className="text-gray-500">İlk sohbetinizi başlatmak için "Yeni Sohbet" butonuna tıklayın.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Sohbet Geçmişi</h3>
        <span className="text-sm text-gray-500">{sessions.length} sohbet</span>
      </div>

      <div className="space-y-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              currentSession?.id === session.id
                ? 'bg-primary-50 border-primary-200'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => handleSessionSelect(session)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {session.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {session.messages.length} mesaj • {session.model}
                </p>
                <div className="flex items-center text-xs text-gray-400 mt-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(session.updatedAt)}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteSession(session.id)
                }}
                className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
