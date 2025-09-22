import { Resource } from '@opentelemetry/resources'
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { ZoneContextManager } from '@opentelemetry/context-zone-peer-dep'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import 'zone.js'

// Enable debug logs in development
if (import.meta.env.DEV) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)
}

const serviceName = (import.meta as any).env.VITE_OTEL_SERVICE_NAME || 'chatmbm'
const otlpEndpoint = ((import.meta as any).env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318').replace(/\/$/, '')

// Initialize provider only once
let initialized = false

function initTracing() {
  if (initialized) return

  const provider = new WebTracerProvider({
    resource: new Resource({
      'service.name': serviceName,
    }),
  })

  const exporter = new OTLPTraceExporter({
    // Collector OTLP HTTP endpoint (no trailing slash); path /v1/traces is appended by exporter
    url: `${otlpEndpoint}/v1/traces`,
  })

  provider.addSpanProcessor(new BatchSpanProcessor(exporter))
  // Use ZoneContextManager only if Zone.js is present; otherwise fall back to default
  const hasZone = typeof window !== 'undefined' && (window as any).Zone
  if (hasZone) {
    provider.register({ contextManager: new ZoneContextManager() })
  } else {
    provider.register()
  }

  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        // Do NOT propagate W3C trace headers to third-party origins to avoid CORS issues
        // (e.g., OpenRouter blocks the `traceparent` header in preflight)
        // Keep spans, but disable header injection for cross-origin requests.
        propagateTraceHeaderCorsUrls: [],
        clearTimingResources: true,
        applyCustomAttributesOnSpan: (span, request, result) => {
          try {
            let url: string | undefined
            if (typeof request === 'string') {
              url = request
            } else if (typeof Request !== 'undefined' && request instanceof Request) {
              url = request.url
            }
            if (url) span.setAttribute('http.url', url)
            if (result) span.setAttribute('fetch.has_result', true)
          } catch {}
        },
      }),
      new XMLHttpRequestInstrumentation({
        // Same rationale as FetchInstrumentation: do not inject trace headers cross-origin
        propagateTraceHeaderCorsUrls: [],
        applyCustomAttributesOnSpan: (span, xhr) => {
          try {
            if (xhr?.responseURL) span.setAttribute('http.url', xhr.responseURL)
          } catch {}
        },
      }),
    ],
  })

  initialized = true
}

// Auto-initialize when imported in the browser
if (typeof window !== 'undefined') {
  initTracing()
}

export {}

// OpenTelemetry temporarily disabled - packages not installed
// TODO: Re-enable when OpenTelemetry packages are properly installed

// Mock exports to prevent import errors
export const trace = {
  getActiveSpan: () => null,
  startActiveSpan: (_name: string, fn: (span: any) => void) => fn({}),
}

export const context = {
  active: () => ({}),
  with: (_ctx: any, fn: () => void) => fn(),
}

export const SpanStatusCode = {
  OK: 1,
  ERROR: 2,
}

export const SpanKind = {
  INTERNAL: 0,
  SERVER: 1,
  CLIENT: 2,
  PRODUCER: 3,
  CONSUMER: 4,
}

export const sdk = {
  start: () => {},
  shutdown: () => Promise.resolve(),
}
