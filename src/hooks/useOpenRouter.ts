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

      // Append a vision-capable model without altering fetched models
      const visionModel: AIModel = {
        id: 'openai/gpt-4o-mini',
        name: 'GPT-4o mini (Vision)',
        description: 'Hızlı, multimodal (görüntü) destekli model',
        context_length: 100000,
        pricing: { prompt: '-', completion: '-' },
        isFree: false,
        supportsVision: true,
      }

      const merged = [visionModel, ...models]
      dispatch({ type: 'SET_MODELS', payload: merged })

      // Prefer a free model when selecting default
      if (merged.length > 0) {
        const firstFree = merged.find(m => m.isFree)
        const currentSelection = merged.find(m => m.id === selectedModel)
        const shouldSelectFree = !selectedModel || !currentSelection || (!currentSelection.isFree && Boolean(firstFree))

        if (shouldSelectFree && firstFree) {
          dispatch({ type: 'SET_SELECTED_MODEL', payload: firstFree.id })
        } else if (!selectedModel) {
          dispatch({ type: 'SET_SELECTED_MODEL', payload: merged[0].id })
        }
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
      const formattedMessages = messages.map(msg => {
        if (msg.imageUrl) {
          return {
            role: msg.role,
            content: [
              { type: 'text', text: msg.content },
              { type: 'image_url', image_url: { url: msg.imageUrl } },
            ],
          }
        }
        return {
          role: msg.role,
          content: msg.content,
        }
      })

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
