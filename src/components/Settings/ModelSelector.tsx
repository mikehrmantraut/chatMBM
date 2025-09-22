import React from 'react'
import { ChevronDown, Check, Loader2, Clock, MessageCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useOpenRouter } from '../../hooks/useOpenRouter'

export default function ModelSelector() {
  const { availableModels, selectedModel, dispatch } = useApp()
  const { isLoadingModels } = useOpenRouter()
  const [isOpen, setIsOpen] = React.useState(false)

  const selectedModelData = availableModels.find(model => model.id === selectedModel)

  const handleModelSelect = (modelId: string) => {
    dispatch({ type: 'SET_SELECTED_MODEL', payload: modelId })
    setIsOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-primary-800 mb-4 flex items-center">
          <MessageCircle className="h-5 w-5 mr-3 text-primary-600" />
          AI Model Seçimi
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={isLoadingModels}
            className="w-full bg-white/80 border-2 border-primary-200 rounded-xl px-4 py-4 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-primary-300 hover:bg-white shadow-sm"
          >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-primary-600" />
                </div>
              <div>
                <div className="font-medium text-gray-900">
                  {isLoadingModels ? 'Modeller yükleniyor...' : 
                   selectedModelData ? selectedModelData.name : 'Model seçin...'}
                </div>
                {selectedModelData && (
                  <div className="text-xs text-gray-500">
                    {selectedModelData.description}
                  </div>
                )}
              </div>
            </div>
            {isLoadingModels ? (
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

            {isOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white/95 backdrop-blur-sm shadow-xl max-h-80 rounded-xl py-2 text-base ring-1 ring-primary-200 overflow-auto focus:outline-none border border-primary-200">
                {availableModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className="w-full text-left px-4 py-4 text-sm text-primary-800 hover:bg-primary-50 flex items-center justify-between transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-primary-800">{model.name}</div>
                        <div className="text-xs text-primary-500 mt-1">{model.description}</div>
                      </div>
                    </div>
                    {selectedModel === model.id && (
                      <Check className="h-5 w-5 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>

        {selectedModelData && (
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200 shadow-sm">
            <h4 className="text-lg font-semibold text-primary-800 mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-3 text-primary-600" />
              Model Bilgileri
            </h4>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-primary-500" />
                <span className="text-primary-700 font-medium">
                  {selectedModelData.context_length.toLocaleString()} tokens
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-primary-700 font-medium">
                  {selectedModelData.isFree ? 'Ücretsiz' : 'Ücretli'}
                </span>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
