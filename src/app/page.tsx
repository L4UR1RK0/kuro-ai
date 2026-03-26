import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlannerApp } from '@/components/planner/PlannerApp'

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect('/auth')

  return <PlannerApp />
}
