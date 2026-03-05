import { useState, useCallback, useRef } from 'react'
import useGameStore from '../store/gameStore'
import { GAME_PHASES } from '../../../shared/types.js'
import { api } from '../api'

export default function PlaidTerminal() {
  const setPhase = useGameStore((s) => s.setPhase)
  const setPlaidConnected = useGameStore((s) => s.setPlaidConnected)
  const setEnvelopeQueue = useGameStore((s) => s.setEnvelopeQueue)
  const setTransactionStats = useGameStore((s) => s.setTransactionStats)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [txnCount, setTxnCount] = useState(0)
  const scriptLoaded = useRef(false)

  const loadPlaidScript = () =>
    new Promise((resolve, reject) => {
      if (window.Plaid) return resolve()
      if (scriptLoaded.current) return resolve()
      const script = document.createElement('script')
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
      script.onload = () => { scriptLoaded.current = true; resolve() }
      script.onerror = () => reject(new Error('Failed to load Plaid script'))
      document.head.appendChild(script)
    })

  const connectPlaid = useCallback(async () => {
    setError(null)
    setStatus('linking')
    try {
      await loadPlaidScript()

      const linkRes = await fetch(api('/api/plaid/link-token'), { method: 'POST' })
      if (!linkRes.ok) {
        const errData = await linkRes.json().catch(() => ({}))
        throw new Error(errData.error || `Server error ${linkRes.status}. Are your Plaid credentials set in server/.env?`)
      }
      const { link_token } = await linkRes.json()
      if (!link_token) throw new Error('No link token returned. Check your PLAID_CLIENT_ID and PLAID_SECRET in server/.env')

      if (document.pointerLockElement) document.exitPointerLock()

      const handler = window.Plaid.create({
        token: link_token,
        onSuccess: async (publicToken) => {
          setStatus('exchanging')
          try {
            const exchRes = await fetch(api('/api/plaid/exchange'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ public_token: publicToken }),
            })
            if (!exchRes.ok) throw new Error('Token exchange failed')

            setStatus('fetching')
            const txnRes = await fetch(api('/api/plaid/transactions'))
            if (!txnRes.ok) throw new Error('Transaction fetch failed')
            const data = await txnRes.json()

            setEnvelopeQueue(data.envelopes)
            setTransactionStats(data.stats)
            setTxnCount(data.envelopes.length)
            setPlaidConnected(true)
            setStatus('ready')
          } catch (e) {
            setError(e.message)
            setStatus('idle')
          }
        },
        onExit: (err) => {
          if (err) setError(`Plaid Link closed: ${err.display_message || err.error_code || 'unknown'}`)
          setStatus('idle')
        },
      })
      handler.open()
    } catch (e) {
      setError(e.message)
      setStatus('idle')
    }
  }, [])

  const skipPlaid = async () => {
    setError(null)
    setStatus('fetching')
    try {
      const txnRes = await fetch(api('/api/plaid/demo-transactions'))
      if (!txnRes.ok) throw new Error('Demo data fetch failed. Is the server running?')
      const data = await txnRes.json()
      setEnvelopeQueue(data.envelopes)
      setTransactionStats(data.stats)
      setTxnCount(data.envelopes.length)
      setPlaidConnected(true)
      setStatus('ready')
    } catch (e) {
      setError(e.message)
      setStatus('idle')
    }
  }

  const startGame = () => setPhase(GAME_PHASES.PLAYING)

  return (
    <div style={overlay}>
      <div style={terminal}>
        <div style={{ color: '#555', fontSize: 11, marginBottom: 16 }}>
          {'━'.repeat(44)}
        </div>
        <h2 style={{ fontSize: 20, letterSpacing: 4, marginBottom: 4, color: '#ccc' }}>
          PLAID LINK TERMINAL
        </h2>
        <div style={{ color: '#555', fontSize: 11, marginBottom: 28 }}>
          {'━'.repeat(44)}
        </div>

        {status === 'idle' && (
          <>
            <p style={{ marginBottom: 24, opacity: 0.6, fontSize: 13, lineHeight: 1.7, color: '#aaa' }}>
              Connect your bank account to feed real transactions
              through the clearing house. Or use demo data to start immediately.
            </p>
            <button onClick={connectPlaid} style={btnPrimary}>
              CONNECT BANK ACCOUNT
            </button>
            <div style={{ margin: '14px 0', opacity: 0.3, fontSize: 11, color: '#666' }}>or</div>
            <button onClick={skipPlaid} style={btnSecondary}>
              USE DEMO DATA
            </button>
            <div style={{ marginTop: 20, fontSize: 10, color: '#444', lineHeight: 1.6 }}>
              Plaid credentials go in: server/.env<br />
              PLAID_CLIENT_ID=xxx<br />
              PLAID_SECRET=xxx<br />
              PLAID_ENV=sandbox
            </div>
          </>
        )}

        {status === 'linking' && <Spinner text="Initializing Plaid Link..." />}
        {status === 'exchanging' && <Spinner text="Securing connection..." />}
        {status === 'fetching' && <Spinner text="Fetching transactions..." />}

        {status === 'ready' && (
          <>
            <div style={{ color: '#00ff88', fontSize: 14, marginBottom: 6 }}>
              CONNECTED
            </div>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 20 }}>
              {txnCount.toLocaleString()} transactions loaded
            </div>
            <button onClick={startGame} style={btnPrimary}>
              BEGIN OPERATIONS
            </button>
          </>
        )}

        {error && (
          <div style={{ color: '#ff4444', marginTop: 16, fontSize: 12, background: '#ff222215', padding: '8px 12px', borderRadius: 3 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

function Spinner({ text }) {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 13, color: '#aaa' }}>{text}</div>
      <div style={{ marginTop: 12, width: 40, height: 2, background: '#00ff88', margin: '12px auto', animation: 'loadbar 1s ease-in-out infinite alternate' }} />
      <style>{`@keyframes loadbar { from { width: 20px; opacity: 0.3; } to { width: 80px; opacity: 1; } }`}</style>
    </div>
  )
}

const overlay = {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.9)',
  zIndex: 20,
  fontFamily: "'Courier New', monospace",
  color: '#ccc',
}

const terminal = {
  background: '#080808',
  border: '1px solid #222',
  padding: '28px 36px',
  maxWidth: 460,
  width: '90%',
  textAlign: 'center',
}

const btnPrimary = {
  fontFamily: "'Courier New', monospace",
  fontSize: 13,
  padding: '10px 28px',
  background: 'transparent',
  border: '1px solid #00ff88',
  color: '#00ff88',
  cursor: 'pointer',
  letterSpacing: 2,
}

const btnSecondary = {
  fontFamily: "'Courier New', monospace",
  fontSize: 12,
  padding: '8px 24px',
  background: 'transparent',
  border: '1px solid #333',
  color: '#666',
  cursor: 'pointer',
  letterSpacing: 1,
}
