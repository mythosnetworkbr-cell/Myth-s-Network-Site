import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// The values below are Supabase's public project URL and publishable key.
// They are intentionally safe to ship in a client application.
const SUPABASE_URL = 'https://rcjexjhziwcynsjmcdap.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_5h0XO-uB9KL3CLYLRXm3Tg_V37WQggx';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
