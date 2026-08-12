import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rcjexjhziwcynsjmcdap.supabase.co';
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_5h0XO-uB9KL3CLYLRXm3Tg_V37WQggx';
const redirectUri = 'rpgram://auth/callback';

export const supabase = url && key
  ? createClient(url, key, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    })
  : null;

if (supabase) {
  const originalSignUp = supabase.auth.signUp.bind(supabase.auth);
  supabase.auth.signUp = ((credentials: any) =>
    originalSignUp({
      ...credentials,
      options: {
        ...(credentials.options || {}),
        emailRedirectTo: redirectUri,
      },
    })) as typeof supabase.auth.signUp;

  const consumeAuthUrl = async (incomingUrl: string | null) => {
    if (!incomingUrl) return;
    try {
      const parsed = new URL(incomingUrl);
      const code = parsed.searchParams.get('code');
      if (code) {
        const result = await supabase.auth.exchangeCodeForSession(code);
        if (result.error) console.warn('[RPgram] auth callback:', result.error.message);
        return;
      }
      const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      if (accessToken && refreshToken) {
        const result = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (result.error) console.warn('[RPgram] auth callback:', result.error.message);
      }
    } catch (error) {
      console.warn('[RPgram] invalid auth callback URL', error);
    }
  };

  Linking.getInitialURL().then(consumeAuthUrl).catch(() => undefined);
  Linking.addEventListener('url', ({ url: incomingUrl }) => { consumeAuthUrl(incomingUrl); });
}
