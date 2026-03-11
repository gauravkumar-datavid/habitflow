import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    // 1. Get all profiles with WhatsApp reminders enabled
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('id, phone_number, callmebot_apikey, full_name')
      .eq('whatsapp_reminder', true)

    if (pError) throw pError

    for (const profile of profiles) {
      if (!profile.phone_number || !profile.callmebot_apikey) continue

      // 2. Check if they have logged anything today
      const { data: logs, error: lError } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('user_id', profile.id)
        .eq('date', today)

      if (lError) continue

      // 3. If no logs, send reminder
      if (logs.length === 0) {
        const message = `Hi ${profile.full_name || 'there'}! 🌿 Don't forget to update your HabitFlow tracker today. Consistency is key! ✨`
        const encodedMsg = encodeURIComponent(message)
        const url = `https://api.callmebot.com/whatsapp.php?phone=${profile.phone_number}&text=${encodedMsg}&apikey=${profile.callmebot_apikey}`

        await fetch(url)
        console.log(`Reminder sent to ${profile.phone_number}`)
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
