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

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
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
          disabled={loading}
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
