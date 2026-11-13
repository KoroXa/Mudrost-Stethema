// src/lib/supabase.js
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Твой URL (без /rest/v1/)
const supabaseUrl = 'https://xplewccvmzrktcpqfvas.supabase.co'; 

// Твой publishable ключ (начинается на sb_publishable_)
const supabaseAnonKey = 'sb_publishable_wQ-es792HmyiORLlmwXxDw_k7v47PP_'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});