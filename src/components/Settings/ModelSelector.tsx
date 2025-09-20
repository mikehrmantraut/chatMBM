import React from 'react'
import { ChevronDown, Check, Loader2 } from 'lucide-react'
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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Model Seçimi
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={isLoadingModels}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="block truncate">
              {isLoadingModels ? 'Modeller yükleniyor...' : 
               selectedModelData ? selectedModelData.name : 'Model seçin...'}
            </span>
            {isLoadingModels ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
              {availableModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.description}</div>
                  </div>
                  {selectedModel === model.id && (
                    <Check className="h-4 w-4 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedModelData && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Model Bilgileri</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Context Length: {selectedModelData.context_length.toLocaleString()} tokens</div>
            <div>Fiyat: {selectedModelData.isFree ? 'Ücretsiz' : 'Ücretli'}</div>
          </div>
        </div>
      )}
    </div>
  )
}
