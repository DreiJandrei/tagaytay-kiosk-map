// supabase.js
import { createClient } from '@supabase/supabase-js'
import { isKioskResetPage } from './recoveryFlag'

const VITE_SUPABASE_URL = 'https://putzqipfdrcctadwtnhl.supabase.co'

// Dito mo i-paste yung mahabang key mula sa pangalawang picture
const VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1dHpxaXBmZHJjY3RhZHd0bmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjkwMzcsImV4cCI6MjA5OTAwNTAzN30.bMTbBMKkmuHsKXqK5IQ4ZNZSka5JRx2QpNfLMI24jYw'

// Ang client ng datos at ng ADMIN. Anonymous ito hangga't walang
// naka-login na admin — iyon ang ginagamit ng kiosk at ng telepono sa
// pagbasa. Hindi nito sinasalo ang token sa `/?reset=kiosk`: sa kiosk
// account iyon, hindi sa admin.
export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
  auth: { detectSessionInUrl: !isKioskResetPage },
})

// ==========================================================
// ANG LOGIN NG KIOSK MISMO (tagaytaykiosk+device@gmail.com)
// ==========================================================
// Hiwalay na client, hiwalay na storageKey. Dalawang dahilan:
//
//   • Tuwing bumabalik sa welcome screen, nila-logout ang admin. Kung
//     iisa ang client, kasama sa logout ang kiosk — at bawat 45 segundo
//     ay hihingi ito ng password.
//   • Hindi dapat admin ang kiosk. Kung ang client ng datos ang naka-login
//     bilang kiosk, iyon ang dadalhin ng bawat query.
export const kioskDevice = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
  auth: {
    storageKey: 'tagaytay-kiosk-device',
    detectSessionInUrl: isKioskResetPage,
  },
})
