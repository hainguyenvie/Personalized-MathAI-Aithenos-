import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Chrome } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation } from 'wouter'

export default function Login() {
  const { user, signInWithGoogle, loading } = useAuth()
  const [, navigate] = useLocation()

  useEffect(() => {
    // Redirect if already logged in
    if (user && !loading) {
      navigate('/')
    }
  }, [user, loading, navigate])

  const handleGoogleSignIn = async () => {
    try {
      console.log('🚀 Starting Google sign in...');
      console.log('Current domain:', window.location.hostname);
      console.log('Current origin:', window.location.origin);
      
      await signInWithGoogle()
    } catch (error) {
      console.error('❌ Login failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-blue-900">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Aithenos Logo" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">
            Chào mừng đến với Aithenos
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Nền tảng học thích ứng với AI để nâng cao kết quả học tập
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            data-testid="button-google-signin"
          >
            <Chrome className="mr-3" size={20} />
            Đăng nhập với Google
          </Button>
          <p className="text-sm text-gray-500 text-center mt-6">
            Bằng cách đăng nhập, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi
          </p>
        </CardContent>
      </Card>
    </div>
  )
}