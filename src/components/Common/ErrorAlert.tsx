import React from 'react'
import { AlertCircle, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function ErrorAlert() {
  const { error, dispatch } = useApp()

  if (!error) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">Hata</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
            className="ml-3 text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
