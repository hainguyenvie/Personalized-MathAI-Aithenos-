import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check for OAuth error in URL first
      const urlParams = new URLSearchParams(window.location.search);
      const errorCode = urlParams.get('error');
      
      if (errorCode) {
        console.log('🚨 OAuth error detected:', errorCode);
        window.history.replaceState({}, document.title, '/login');
        navigate('/login?error=oauth_failed');
        return;
      }

      console.log('🔄 OAuth callback - processing authentication...');
      console.log('📍 Callback URL:', window.location.href);
      console.log('🔗 URL search params:', window.location.search);
      console.log('🔗 URL hash:', window.location.hash.substring(0, 50) + '...');
      
      let hasRedirected = false;
      let timeoutId: NodeJS.Timeout | undefined;
      
      // Handle the auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth event in callback:', event, session ? 'Session active' : 'No session');
        
        if (event === 'SIGNED_IN' && session && !hasRedirected) {
          console.log('✅ Successfully signed in! Redirecting to home...');
          hasRedirected = true;
          clearTimeout(timeoutId);
          subscription.unsubscribe();
          window.history.replaceState({}, document.title, '/');
          navigate('/');
        } else if (event === 'SIGNED_OUT' && !hasRedirected) {
          console.log('❌ Sign out detected in callback');
          hasRedirected = true;
          clearTimeout(timeoutId);
          subscription.unsubscribe();
          window.history.replaceState({}, document.title, '/login');
          navigate('/login?error=signed_out');
        }
      });

      // Explicitly handle the OAuth code exchange if present
      const urlContainsAuthParams = window.location.hash.includes('access_token') || 
                                   window.location.search.includes('code=');
      
      if (urlContainsAuthParams) {
        console.log('🔑 Auth parameters detected, processing...');
        try {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        } catch (error) {
          console.log('❌ Code exchange error:', error);
          if (!hasRedirected) {
            hasRedirected = true;
            if (timeoutId) clearTimeout(timeoutId);
            subscription.unsubscribe();
            window.history.replaceState({}, document.title, '/login');
            navigate('/login?error=exchange_failed');
          }
        }
      }

      // Check for existing session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session && !hasRedirected) {
        console.log('✅ Existing session found! Redirecting to home...');
        hasRedirected = true;
        if (timeoutId) clearTimeout(timeoutId);
        subscription.unsubscribe();
        window.history.replaceState({}, document.title, '/');
        navigate('/');
      }
      
      // Set up fallback timeout (redirect to login after 8 seconds if no session)
      timeoutId = setTimeout(() => {
        if (!hasRedirected) {
          console.log('⏰ Callback timeout - redirecting to login');
          hasRedirected = true;
          subscription.unsubscribe();
          window.history.replaceState({}, document.title, '/login');
          navigate('/login?error=timeout');
        }
      }, 8000);

      // Cleanup function
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        subscription.unsubscribe();
      };
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Đang xác thực...</p>
      </div>
    </div>
  );
}