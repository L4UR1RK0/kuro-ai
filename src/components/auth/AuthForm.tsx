'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/')
    }

    setLoading(false)
  }

  // Prerequisites (Supabase dashboard):
  //   1. Authentication → Providers → Google → Enable
  //   2. Add your Google OAuth client ID + secret
  //   3. Register the redirect URI in Google Cloud Console:
  //      https://<project-ref>.supabase.co/auth/v1/callback
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setMessage(error.message)
      setGoogleLoading(false)
    }
    // On success the browser navigates away — no need to setGoogleLoading(false)
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      {/* Google OAuth */}
      <Button
        type="button"
        variant="ghost"
        disabled={googleLoading || loading}
        onClick={handleGoogleSignIn}
        className="w-full mb-4 border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center gap-3"
      >
        {/* Google "G" logo */}
        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden>
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/30">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-white/60 text-xs mb-1 block">Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <Label className="text-white/60 text-xs mb-1 block">Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>

        {message && (
          <p className="text-xs text-blue-400 bg-blue-400/10 rounded-lg px-3 py-2">{message}</p>
        )}

        <Button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-xs text-white/40 mt-4">
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
