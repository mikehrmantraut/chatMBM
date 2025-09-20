import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { OpenRouterService } from '../services/openrouter'
import { AIModel, Message } from '../types'

export function useOpenRouter() {
  const { dispatch, selectedModel } = useApp()
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [isLoadingMessage, setIsLoadingMessage] = useState(false)

  const fetchModels = async () => {
    setIsLoadingModels(true)
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      const models = await OpenRouterService.getModels()
      dispatch({ type: 'SET_MODELS', payload: models })
      
      // Set first model as default if none selected
      if (models.length > 0 && !selectedModel) {
        dispatch({ type: 'SET_SELECTED_MODEL', payload: models[0].id })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch models'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    } finally {
      setIsLoadingModels(false)
    }
  }

  const sendMessage = async (
    messages: Message[],
    model: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    setIsLoadingMessage(true)
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))

      if (onChunk) {
        // Use streaming for better UX
        await OpenRouterService.sendMessageStream(formattedMessages, model, onChunk)
        return ''
      } else {
        // Use regular API call
        return await OpenRouterService.sendMessage(formattedMessages, model)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    } finally {
      setIsLoadingMessage(false)
    }
  }

  // Fetch models on mount
  useEffect(() => {
    fetchModels()
  }, [])

  return {
    fetchModels,
    sendMessage,
    isLoadingModels,
    isLoadingMessage,
  }
}
