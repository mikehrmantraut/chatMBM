import { useCallback } from 'react'
import { context, trace, SpanStatusCode } from '@opentelemetry/api'

export function useTelemetry() {
  const tracer = trace.getTracer((import.meta as any).env.VITE_OTEL_SERVICE_NAME || 'chatmbm')

  const createSpan = useCallback((
    name: string,
    attributes: Record<string, string | number | boolean> = {}
  ) => {
    const span = tracer.startSpan(name)
    Object.entries(attributes).forEach(([key, value]) => span.setAttribute(key, value as any))
    return span
  }, [tracer])

  const traceAsync = useCallback(async <T>(
    name: string,
    fn: () => Promise<T>,
    attributes: Record<string, string | number | boolean> = {}
  ): Promise<T> => {
    const span = tracer.startSpan(name)
    Object.entries(attributes).forEach(([key, value]) => span.setAttribute(key, value as any))
    try {
      return await context.with(trace.setSpan(context.active(), span), fn)
    } catch (error: any) {
      span.recordException(error)
      span.setStatus({ code: SpanStatusCode.ERROR, message: error?.message })
      throw error
    } finally {
      span.end()
    }
  }, [tracer])

  const traceSync = useCallback(<T>(
    name: string,
    fn: () => T,
    attributes: Record<string, string | number | boolean> = {}
  ): T => {
    const span = tracer.startSpan(name)
    Object.entries(attributes).forEach(([key, value]) => span.setAttribute(key, value as any))
    try {
      return context.with(trace.setSpan(context.active(), span), fn)
    } catch (error: any) {
      span.recordException(error)
      span.setStatus({ code: SpanStatusCode.ERROR, message: error?.message })
      throw error
    } finally {
      span.end()
    }
  }, [tracer])

  const addEvent = useCallback((
    spanName: string,
    eventName: string,
    attributes: Record<string, string | number | boolean> = {}
  ) => {
    const span = tracer.startSpan(spanName)
    span.addEvent(eventName, attributes as any)
    span.end()
  }, [tracer])

  return {
    createSpan,
    traceAsync,
    traceSync,
    addEvent,
  }
}
