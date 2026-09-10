'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

const HEADERS = {
  'content-type': 'application/json',
  'x-api-key': API_KEY
}

// ==============================
// Step indicator
// ==============================
function Steps({ current }) {
  const steps = ['Email', 'Magic Link', 'Premium']
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      marginBottom: 32,
      justifyContent: 'center'
    }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600,
            background: i <= current ? 'var(--accent)' : 'var(--card)',
            color: i <= current ? '#fff' : 'var(--muted)',
            border: `1px solid ${i <= current ? 'var(--accent)' : 'var(--border)'}`,
            transition: 'all .3s'
          }}>
            {i < current ? '✓' : i + 1}
          </div>
          <span style={{
            fontSize: 13,
            color: i <= current ? 'var(--text)' : 'var(--muted)'
          }}>
            {s}
          </span>
          {i < steps.length - 1 && (
            <div style={{
              width: 24, height: 1,
              background: i < current ? 'var(--accent)' : 'var(--border)'
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [link, setLink] = useState('')
  const [step, setStep] = useState(0)       // 0=email, 1=paste link, 2=done
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)       // { type: 'ok' | 'err', text: '' }
  const [premium, setPremium] = useState(null)

  const notify = (type, text) => setMsg({ type, text })
  const reset = () => {
    setEmail(''); setLink(''); setStep(0); setMsg(null); setPremium(null)
  }

  // ==============================
  // 1. Kirim magic link
  // ==============================
  const sendLink = async () => {
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return notify('err', 'Masukkan email yang valid')
    }
    setLoading(true); setMsg(null)
    try {
      const r = await fetch(`${API}/api/am/send`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ email: trimmed })
      })
      const d = await r.json()
      if (d.ok) {
        setStep(1)
        notify('ok', '✅ Magic link terkirim! Buka email kamu, copy link-nya, lalu paste di bawah.')
      } else {
        notify('err', `❌ ${d.why || 'Gagal kirim magic link'}`)
      }
    } catch (e) {
      notify('err', `❌ ${e.message}`)
    }
    setLoading(false)
  }

  // ==============================
  // 2. Verifikasi + aktivasi premium
  // ==============================
  const activatePremium = async () => {
    if (!link.trim()) return notify('err', 'Paste magic link dulu')
    setLoading(true); setMsg(null)
    try {
      // Step A: verify → dapat idToken
      const vr = await fetch(`${API}/api/am/verify`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ email: email.trim(), link: link.trim() })
      })
      const vd = await vr.json()
      if (!vd.ok) {
        setLoading(false)
        return notify('err', `❌ ${vd.why || 'Verifikasi gagal'}`)
      }

      // Step B: aktivasi premium pakai idToken
      const pr = await fetch(`${API}/api/am/premium`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ email: email.trim(), idToken: vd.idToken })
      })
      const pd = await pr.json()

      if (pd.ok) {
        setStep(2)
        setPremium(pd)
        notify('ok', '🎉 Premium aktif! Buka Alight Motion kamu, login dengan email yang sama.')
      } else {
        notify('err', `❌ ${pd.why || 'Aktivasi premium gagal'}`)
      }
    } catch (e) {
      notify('err', `❌ ${e.message}`)
    }
    setLoading(false)
  }

  return (
    <main style={{
      maxWidth: 520,
      margin: '0 auto',
      padding: '64px 20px 40px'
    }}>
      <section className="hero-thumb">
        <div className="hero-grid" />
        <div className="hero-ring hero-ring-a" />
        <div className="hero-ring hero-ring-b" />
        <div className="hero-center">
          <div className="hero-mark">K</div>
          <div>
            <strong>KYZX</strong>
            <span>GENERATOR AM</span>
          </div>
        </div>
        <span className="hero-ratio">16:9 / K-FRAME</span>
      </section>

      <header style={{ textAlign: 'left', marginBottom: 40 }} className="site-header">
        <div style={{
          display: 'inline-block',
          padding: '6px 14px',
          borderRadius: 999,
          background: 'rgba(124, 92, 255, 0.12)',
          border: '1px solid rgba(124, 92, 255, 0.3)',
          color: 'var(--accent)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.5,
          marginBottom: 16
        }}>
          KYZX GENERATOR AM
        </div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: -0.5,
          marginBottom: 12
        }}>
          AM Premium Generator
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.5 }}>
          Generate & aktivasi melalui alur email dan magic link dalam 3 langkah.
        </p>
      </header>

      {/* Steps */}
      <Steps current={step} />

      {/* Card */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 28
      }}>

        {/* ========== STEP 0: EMAIL ========== */}
        {step === 0 && (
          <div>
            <label style={{
              display: 'block',
              fontSize: 13,
              color: 'var(--muted)',
              marginBottom: 8
            }}>
              Email Alight Motion
            </label>
            <input
              type="email"
              placeholder="kamu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && sendLink()}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text)',
                fontSize: 15,
                outline: 'none',
                transition: 'border .2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={sendLink}
              disabled={loading || !email}
              style={{
                width: '100%',
                marginTop: 16,
                padding: '14px 16px',
                background: loading || !email ? 'var(--border)' : 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading || !email ? 'not-allowed' : 'pointer',
                transition: 'background .2s'
              }}
            >
              {loading ? 'Mengirim...' : 'Kirim Magic Link →'}
            </button>
          </div>
        )}

        {/* ========== STEP 1: PASTE LINK ========== */}
        {step === 1 && (
          <div>
            <div style={{
              padding: 12,
              borderRadius: 10,
              background: 'rgba(124, 92, 255, 0.08)',
              border: '1px solid rgba(124, 92, 255, 0.25)',
              fontSize: 13,
              color: 'var(--muted)',
              marginBottom: 20,
              lineHeight: 1.5
            }}>
              📧 Cek email <strong style={{ color: 'var(--text)' }}>{email}</strong>.<br />
              Copy link yang kamu terima, lalu paste di bawah.
            </div>

            <label style={{
              display: 'block',
              fontSize: 13,
              color: 'var(--muted)',
              marginBottom: 8
            }}>
              Magic Link
            </label>
            <textarea
              placeholder="Paste link dari email di sini..."
              value={link}
              onChange={e => setLink(e.target.value)}
              disabled={loading}
              rows={4}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text)',
                fontSize: 13,
                fontFamily: 'monospace',
                resize: 'vertical',
                outline: 'none',
                transition: 'border .2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />

            <button
              onClick={activatePremium}
              disabled={loading || !link}
              style={{
                width: '100%',
                marginTop: 16,
                padding: '14px 16px',
                background: loading || !link ? 'var(--border)' : 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading || !link ? 'not-allowed' : 'pointer',
                transition: 'background .2s'
              }}
            >
              {loading ? 'Memproses...' : '⚡ Aktifkan Premium'}
            </button>

            <button
              onClick={() => { setStep(0); setLink(''); setMsg(null) }}
              disabled={loading}
              style={{
                width: '100%',
                marginTop: 8,
                padding: '12px 16px',
                background: 'transparent',
                color: 'var(--muted)',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              ← Ganti email
            </button>
          </div>
        )}

        {/* ========== STEP 2: SUKSES ========== */}
        {step === 2 && premium && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 72,
              height: 72,
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '2px solid var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 10, fontWeight: 700 }}>
              Premium Aktif!
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Buka <strong style={{ color: 'var(--text)' }}>Alight Motion</strong> dan login pakai email{' '}
              <strong style={{ color: 'var(--text)' }}>{email}</strong>.<br />
              Fitur premium otomatis terbuka.
            </p>

            <div style={{
              padding: 14,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              textAlign: 'left',
              fontSize: 12,
              color: 'var(--muted)',
              fontFamily: 'monospace',
              marginBottom: 20
            }}>
              <div>Order ID: <span style={{ color: 'var(--text)' }}>{premium.orderId}</span></div>
              <div style={{ marginTop: 4 }}>Plan: <span style={{ color: 'var(--success)' }}>{premium.plan}</span></div>
            </div>

            <button
              onClick={reset}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Aktifkan Email Lain
            </button>
          </div>
        )}

        {/* ========== MESSAGE ========== */}
        {msg && (
          <div style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 10,
            fontSize: 13,
            lineHeight: 1.5,
            background: msg.type === 'ok'
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${msg.type === 'ok' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: msg.type === 'ok' ? '#86efac' : '#fca5a5'
          }}>
            {msg.text}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        marginTop: 32,
        fontSize: 12,
        color: 'var(--muted)'
      }}>
        © {new Date().getFullYear()} kyzx.my.id
      </footer>
    </main>
  )
}