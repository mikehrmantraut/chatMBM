import { MessageCircle, Trash2, Calendar } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ChatSession } from '../../types'

interface ChatHistoryProps {
  onSessionSelected?: () => void
}

export default function ChatHistory({ onSessionSelected }: ChatHistoryProps) {
  const { sessions, currentSession, dispatch } = useApp()

  const handleSessionSelect = (session: ChatSession) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session })
    onSessionSelected?.()
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
      <div className="text-center py-12">
        <MessageCircle className="h-16 w-16 text-primary-300 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-primary-800 mb-3">Henüz sohbet yok</h3>
        <p className="text-primary-500 mb-6">İlk sohbetinizi başlatmak için "Yeni Sohbet" butonuna tıklayın.</p>
        <div className="text-sm text-primary-400 bg-primary-50 px-4 py-2 rounded-lg border border-primary-200 inline-block">
          💡 Tüm sohbetleriniz burada görünecek
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-primary-800">Sohbet Geçmişi</h3>
        <span className="text-sm text-primary-500 bg-primary-100 px-3 py-1 rounded-full">{sessions.length} sohbet</span>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 shadow-sm ${
              currentSession?.id === session.id
                ? 'bg-primary-100 border-primary-300 shadow-md'
                : 'bg-white/80 border-primary-200 hover:bg-primary-50 hover:border-primary-300 hover:shadow-md'
            }`}
            onClick={() => handleSessionSelect(session)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-primary-800 truncate mb-2">
                  {session.title}
                </h4>
                <p className="text-xs text-primary-500 mb-3">
                  {session.messages.length} mesaj • {session.model}
                </p>
                <div className="flex items-center text-xs text-primary-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(session.updatedAt)}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteSession(session.id)
                }}
                className="ml-3 p-2 text-primary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
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
