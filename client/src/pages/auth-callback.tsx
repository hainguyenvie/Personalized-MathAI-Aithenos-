import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Development-only logging (never log sensitive URLs in production)
        if (import.meta.env.DEV) {
          console.log('Auth callback processing...');
        }
        
        // Check for error in URL first
        const urlParams = new URLSearchParams(window.location.search);
        const errorCode = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (errorCode) {
          if (import.meta.env.DEV) {
            console.error('OAuth error:', errorCode);
          }
          // Clean up URL and redirect
          window.history.replaceState({}, document.title, '/login');
          navigate('/login?error=oauth_failed');
          return;
        }
        
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          if (import.meta.env.DEV) {
            console.error('Auth session error:', error.message);
          }
          window.history.replaceState({}, document.title, '/login');
          navigate('/login?error=session_failed');
          return;
        }

        if (data.session && data.session.user) {
          if (import.meta.env.DEV) {
            console.log('Auth successful for user:', data.session.user.email);
          }
          // Clean up URL and redirect to home
          window.history.replaceState({}, document.title, '/');
          navigate('/');
        } else {
          // Wait for Supabase to process the callback
          setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getSession();
            if (retryData.session) {
              if (import.meta.env.DEV) {
                console.log('Session established after retry');
              }
              window.history.replaceState({}, document.title, '/');
              navigate('/');
            } else {
              if (import.meta.env.DEV) {
                console.log('No session found after callback processing');
              }
              window.history.replaceState({}, document.title, '/login');
              navigate('/login?error=no_session');
            }
          }, 1000);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Auth callback failed:', error);
        }
        window.history.replaceState({}, document.title, '/login');
        navigate('/login?error=callback_exception');
      }
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