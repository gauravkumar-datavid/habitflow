import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  try {
    // 1. Get all profiles with reminders enabled
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('id, phone_number, callmebot_apikey, full_name')
      .eq('whatsapp_reminder', true)

    if (pError) throw pError

    const today = new Date()
    const lastWeek = new Date(today)
    lastWeek.setDate(today.getDate() - 7)
    const lastWeekStr = lastWeek.toISOString().split('T')[0]

    for (const profile of profiles) {
      if (!profile.phone_number || !profile.callmebot_apikey) continue

      // 2. Get habits and logs for the past week
      const { data: habits, error: hError } = await supabase.from('habits').select('id, name, emoji, target_days').eq('user_id', profile.id)
      const { data: logs, error: lError } = await supabase.from('habit_logs').select('habit_id, date').eq('user_id', profile.id).gte('date', lastWeekStr)

      if (hError || lError) continue

      // 3. Calculate summary
      let reportMsg = `📊 *Weekly HabitFlow Report* 📊\n\n`
      habits.forEach(h => {
        const done = logs.filter(l => l.habit_id === h.id).length
        const pct = Math.round((done / 7) * 100)
        const goalStatus = done >= h.target_days ? '✅ Goal Met!' : '❌ Goal Missed'
        reportMsg += `${h.emoji} *${h.name}*: ${done}/7 days (${pct}%) - ${goalStatus}\n`
      })

      reportMsg += `\nKeep up the great work! 🚀`
      
      // 4. Send WhatsApp
      const encodedMsg = encodeURIComponent(reportMsg)
      const url = `https://api.callmebot.com/whatsapp.php?phone=${profile.phone_number}&text=${encodedMsg}&apikey=${profile.callmebot_apikey}`
      
      await fetch(url)
      console.log(`Weekly report sent to ${profile.phone_number}`)
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
