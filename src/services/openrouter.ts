import { AIModel, OpenRouterResponse } from '../types'
import { trace, SpanStatusCode, SpanKind } from '@opentelemetry/api'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1'
const API_KEY = (import.meta as any).env.VITE_OPENROUTER_API_KEY

if (!API_KEY) {
  console.warn('OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your .env file')
}

export class OpenRouterService {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!API_KEY) {
      throw new Error('OpenRouter API key is required')
    }

    const tracer = trace.getTracer((import.meta as any).env.VITE_OTEL_SERVICE_NAME || 'chatmbm')
    const span = tracer.startSpan('openrouter.request', { kind: SpanKind.CLIENT })
    span.setAttribute('http.method', (options.method || 'GET').toString())
    span.setAttribute('http.url', `${OPENROUTER_API_URL}${endpoint}`)

    const response = await fetch(`${OPENROUTER_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ChatMBM - AI Chat Application',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = (
        errorData.error?.message || 
        `API request failed with status ${response.status}`
      ) as string
      span.recordException({ name: 'OpenRouterError', message })
      span.setStatus({ code: SpanStatusCode.ERROR, message })
      span.end()
      throw new Error(message)
    }
    const json = await response.json()
    span.setAttribute('http.status_code', response.status)
    span.end()
    return json
  }

  static async getModels(): Promise<AIModel[]> {
    try {
      const response = await this.makeRequest('/models')
      
      // Filter for free models and format the response
      const freeModels = response.data
        .filter((model: any) => {
          // Check if model is free (pricing is 0 or null)
          const pricing = model.pricing
          return (
            (pricing?.prompt === '0' || pricing?.prompt === 0 || !pricing?.prompt) &&
            (pricing?.completion === '0' || pricing?.completion === 0 || !pricing?.completion)
          )
        })
        .map((model: any) => ({
          id: model.id,
          name: model.name,
          description: model.description || 'No description available',
          context_length: model.context_length || 0,
          pricing: {
            prompt: model.pricing?.prompt || '0',
            completion: model.pricing?.completion || '0',
          },
          isFree: true,
        }))
        .slice(0, 10) // Limit to first 10 free models

      return freeModels
    } catch (error) {
      console.error('Error fetching models:', error)
      throw new Error('Failed to fetch AI models')
    }
  }

  static async sendMessage(
    messages: Array<{ role: string; content: string | any[] }>,
    model: string
  ): Promise<string> {
    try {
      const response = await this.makeRequest('/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      const openRouterResponse: OpenRouterResponse = response
      
      if (openRouterResponse.choices && openRouterResponse.choices.length > 0) {
        return openRouterResponse.choices[0].message.content
      }

      throw new Error('No response from AI model')
    } catch (error) {
      console.error('Error sending message:', error)
      throw new Error('Failed to send message to AI model')
    }
  }

  static async sendMessageStream(
    messages: Array<{ role: string; content: string | any[] }>,
    model: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'ChatMBM - AI Chat Application',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error?.message || 
          `API request failed with status ${response.status}`
        )
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                onChunk(content)
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in streaming:', error)
      throw new Error('Failed to stream message from AI model')
    }
  }
}
