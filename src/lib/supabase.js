// supabase.js
import { createClient } from '@supabase/supabase-js'

const VITE_SUPABASE_URL = 'https://putzqipfdrcctadwtnhl.supabase.co'

// Dito mo i-paste yung mahabang key mula sa pangalawang picture
const VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1dHpxaXBmZHJjY3RhZHd0bmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjkwMzcsImV4cCI6MjA5OTAwNTAzN30.bMTbBMKkmuHsKXqK5IQ4ZNZSka5JRx2QpNfLMI24jYw' 

export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)