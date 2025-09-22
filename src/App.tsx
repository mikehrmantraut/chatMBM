import { useState } from 'react'
import { MessageCircle, Settings, History } from 'lucide-react'
import { AppProvider } from './context/AppContext'
import { useChatSessions } from './hooks/useChatSessions'
import ChatInterface from './components/Chat/ChatInterface'
import NewChatButton from './components/Chat/NewChatButton'
import ChatHistory from './components/History/ChatHistory'
import ModelSelector from './components/Settings/ModelSelector'
import ErrorAlert from './components/Common/ErrorAlert'

function SessionBootstrapper() {
  useChatSessions()
  return null
}

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'settings'>('chat')

  return (
    <AppProvider>
      <SessionBootstrapper />
      <div className="min-h-screen bg-warm-50 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-primary-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/assets/madlen.svg" 
                alt="ChatMBM Logo" 
                className="h-10 w-30 cursor-pointer"
                onClick={() => setActiveTab('chat')}
              />
            </div>
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'chat'
                      ? 'text-primary-600 bg-primary-100 shadow-sm'
                      : 'text-primary-400 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Sohbet
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'history'
                      ? 'text-primary-600 bg-primary-100 shadow-sm'
                      : 'text-primary-400 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <History className="h-4 w-4 mr-2" />
                  Geçmiş
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'settings'
                      ? 'text-primary-600 bg-primary-100 shadow-sm'
                      : 'text-primary-400 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Ayarlar
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
                <div className="lg:col-span-1">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-primary-200 p-6">
                    <NewChatButton />
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-primary-200 h-full overflow-hidden">
                    <ChatInterface />
                  </div>
                </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-primary-200 p-6">
              <ChatHistory onSessionSelected={() => setActiveTab('chat')} />
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-primary-200 p-6">
              <h2 className="text-lg font-semibold text-primary-800 mb-6">Ayarlar</h2>
              <ModelSelector />
            </div>
          )}
        </main>
        <ErrorAlert />
      </div>
    </AppProvider>
  )
}

export default App
