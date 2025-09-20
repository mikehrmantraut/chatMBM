import { useState } from 'react'
import { MessageCircle, Settings, History } from 'lucide-react'
import { AppProvider } from './context/AppContext'
import ChatInterface from './components/Chat/ChatInterface'
import NewChatButton from './components/Chat/NewChatButton'
import ChatHistory from './components/History/ChatHistory'
import ModelSelector from './components/Settings/ModelSelector'
import ErrorAlert from './components/Common/ErrorAlert'

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'settings'>('chat')

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-primary-600" />
                <h1 className="ml-2 text-xl font-semibold text-gray-900">ChatMBM</h1>
              </div>
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'chat'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Sohbet
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'history'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <History className="h-4 w-4 mr-2" />
                  Geçmiş
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'settings'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700'
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="card">
                  <NewChatButton />
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="card h-96">
                  <ChatInterface />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="card">
              <ChatHistory />
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Ayarlar</h2>
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
