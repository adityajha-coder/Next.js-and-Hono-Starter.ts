'use client'

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { client } from '@/lib/honoClient'
import { Button } from '@/components/ui/button'

type EndpointKey = 'health' | 'echo'
type Result = { id: number; key: EndpointKey; status: number; ms: number; body: unknown }

const ENDPOINTS = {
  health: { label: 'GET /health', route: 'health', code: 'client.api.health.$get()' },
  echo: { label: 'POST /echo', route: 'echo', code: 'client.api.example.echo.$post({ json: { text } })' },
} as const

const GH_COMMAND = 'gh repo create my-app --template adityajha-coder/Next.js-and-Hono-Starter.ts --clone'
const GIT_CLONE_COMMAND = 'git clone https://github.com/adityajha-coder/Next.js-and-Hono-Starter.ts.git my-app'

const statusColor = (status: number) => (status === 0 ? '#ef4444' : status < 300 ? '#10b981' : '#f59e0b')

const CSS = `
@keyframes rise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
@keyframes reveal { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
@keyframes pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.2) } 100% { transform: scale(1); opacity: 1 } }
@keyframes travel { from { left: 0% } to { left: 100% } }
.a-rise { opacity: 0; animation: rise .6s cubic-bezier(.2,.7,.2,1) forwards }
.a-reveal { animation: reveal .35s ease-out }
.a-pop { animation: pop .4s ease-out }
.a-travel { animation: travel .8s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .a-rise { opacity: 1; animation: none }
  .a-reveal, .a-pop { animation: none }
  .a-travel { display: none }
}
`

function Track({
  api,
  loading,
  route,
  result,
}: {
  api: { online: boolean; ms: number } | null
  loading: boolean
  route: string
  result: Result | null
}) {
  const apiColor = api === null ? '#94a3b8' : api.online ? '#10b981' : '#ef4444'
  const routeColor = result ? statusColor(result.status) : undefined

  return (
    <div className="mx-auto w-full max-w-md px-2">
      <div className="relative flex h-3 items-center justify-between">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <span className="relative size-3 rounded-full border-2 border-foreground bg-background" />
        <span className="relative size-3 rounded-full border-2 bg-background transition-colors duration-300" style={{ borderColor: apiColor }} />
        <span
          key={result?.id ?? 'none'}
          className={`relative size-3 rounded-full border-2 bg-background transition-colors duration-300 ${result ? 'a-pop' : ''}`}
          style={{ borderColor: routeColor ?? 'var(--border)', background: routeColor ?? undefined }}
        />
        {loading && <span className="a-travel absolute top-1/2 -ml-1 -mt-1 size-2 rounded-full bg-amber-500" />}
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <span className="w-20 text-left">Browser</span>
        <span className="w-20 text-center text-muted-foreground">
          API {api === null ? '' : api.online ? `${api.ms} ms` : 'offline'}
        </span>
        <span className="w-20 text-right text-muted-foreground">{route}</span>
      </div>
    </div>
  )
}

export default function Home() {
  const [active, setActive] = useState<EndpointKey>('health')
  const [text, setText] = useState('Hello from the typed client')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [api, setApi] = useState<{ online: boolean; ms: number } | null>(null)
  const [copiedCmd, setCopiedCmd] = useState<'gh' | 'git' | null>(null)

  // Ping the API once on load so the track shows live status straight away
  useEffect(() => {
    let alive = true
    const start = performance.now()
    client.api.health
      .$get()
      .then((res) => alive && setApi({ online: res.ok, ms: Math.round(performance.now() - start) }))
      .catch(() => alive && setApi({ online: false, ms: 0 }))
    return () => {
      alive = false
    }
  }, [])

  const send = async () => {
    setLoading(true)
    const start = performance.now()
    let status = 0
    let body: unknown = { error: 'Could not reach the API. Check that the dev server is running.' }

    try {
      const res = active === 'health' ? await client.api.health.$get() : await client.api.example.echo.$post({ json: { text } })
      status = res.status
      body = await res.json().catch(() => null)
    } catch {
      // keep the default network error body
    }

    // Keep the packet moving for a moment so fast local responses are still visible
    const elapsed = performance.now() - start
    if (elapsed < 600) await new Promise((r) => setTimeout(r, 600 - elapsed))

    setResult({ id: Date.now(), key: active, status, ms: Math.round(elapsed), body })
    setLoading(false)
  }

  const copyCommand = async (cmd: 'gh' | 'git', textToCopy: string) => {
    await navigator.clipboard.writeText(textToCopy)
    setCopiedCmd(cmd)
    setTimeout(() => setCopiedCmd(null), 1500)
  }

  const delay = (ms: number) => ({ animationDelay: `${ms}ms` })

  return (
    <main className="min-h-screen bg-background text-foreground">
      <style>{CSS}</style>

      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-10 px-6 py-16">
        <header className="space-y-3 text-center">
          <h1 className="a-rise text-4xl font-bold tracking-tight sm:text-5xl" style={delay(0)}>
            Stack is running.
          </h1>
          <p className="a-rise text-muted-foreground" style={delay(80)}>
            Next.js, Hono and shadcn/ui, connected end to end. Send a request to see it work.
          </p>
        </header>

        <div className="a-rise" style={delay(160)}>
          <Track api={api} loading={loading} route={ENDPOINTS[active].route} result={result?.key === active ? result : null} />
        </div>

        <section className="a-rise space-y-4 rounded-2xl border bg-card p-4 shadow-sm" style={delay(240)}>
          {/* Segmented control with a sliding indicator */}
          <div className="relative grid grid-cols-2 rounded-lg bg-muted p-1" role="radiogroup" aria-label="Endpoint">
            <span
              aria-hidden
              className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-md bg-background shadow-sm transition-transform duration-300 ease-out"
              style={{ transform: active === 'echo' ? 'translateX(100%)' : 'translateX(0)' }}
            />
            {(Object.keys(ENDPOINTS) as EndpointKey[]).map((key) => (
              <button
                key={key}
                role="radio"
                aria-checked={active === key}
                onClick={() => setActive(key)}
                className={`relative z-10 rounded-md py-1.5 font-mono text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
                  active === key ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {ENDPOINTS[key].label}
              </button>
            ))}
          </div>

          {/* Input slides open only for the echo endpoint */}
          <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${active === 'echo' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <label htmlFor="echo-text" className="sr-only">
                Text to send
              </label>
              <input
                id="echo-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                tabIndex={active === 'echo' ? 0 : -1}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
              />
            </div>
          </div>

          <p className="overflow-x-auto whitespace-nowrap font-mono text-xs text-muted-foreground">{ENDPOINTS[active].code}</p>

          <Button className="w-full active:scale-[0.98]" size="lg" onClick={send} disabled={loading || (active === 'echo' && text.trim() === '')}>
            {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            {loading ? 'Sending' : 'Send request'}
          </Button>

          <div className="min-h-32 rounded-lg bg-muted/60 p-4">
            {result ? (
              <div key={result.id} className="a-reveal space-y-3">
                <div className="flex items-center justify-between font-mono text-sm">
                  <span className="flex items-center gap-2">
                    <span className="a-pop size-2.5 rounded-full" style={{ background: statusColor(result.status) }} />
                    {result.status === 0 ? 'No response' : result.status}
                  </span>
                  <span className="text-muted-foreground">{result.ms} ms</span>
                </div>
                <pre className="overflow-x-auto font-mono text-xs leading-relaxed">{JSON.stringify(result.body, null, 2)}</pre>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">The response will appear here.</p>
            )}
          </div>
        </section>

        <footer className="a-rise space-y-4 text-center text-sm text-muted-foreground" style={delay(320)}>
          <div className="space-y-2.5 text-left">
            <p className="text-xs font-medium text-foreground">Create Project</p>

            {/* GitHub CLI command */}
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 shadow-xs">
              <div className="min-w-0 flex-1 overflow-x-auto font-mono text-xs text-foreground">
                <span className="text-muted-foreground select-none">$ </span>
                <span className="whitespace-nowrap">{GH_COMMAND}</span>
              </div>
              <button
                onClick={() => copyCommand('gh', GH_COMMAND)}
                className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                title="Copy GitHub CLI command"
                aria-label="Copy GitHub CLI command"
              >
                {copiedCmd === 'gh' ? (
                  <Check className="size-4 text-emerald-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>

            {/* Standard Git Clone command */}
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 shadow-xs">
              <div className="min-w-0 flex-1 overflow-x-auto font-mono text-xs text-foreground">
                <span className="text-muted-foreground select-none">$ </span>
                <span className="whitespace-nowrap">{GIT_CLONE_COMMAND}</span>
              </div>
              <button
                onClick={() => copyCommand('git', GIT_CLONE_COMMAND)}
                className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                title="Copy Git clone command"
                aria-label="Copy Git clone command"
              >
                {copiedCmd === 'git' ? (
                  <Check className="size-4 text-emerald-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs">
            Edit <code className="font-mono text-xs">src/app/page.tsx</code> to make it yours.
          </p>
        </footer>
      </div>
    </main>
  )
}