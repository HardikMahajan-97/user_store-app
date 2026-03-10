import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { HiMail, HiKey } from 'react-icons/hi'
import api from '../../api/axios'
import FormInput from '../../components/common/FormInput'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState(null)

  const validate = () => {
    if (!email) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setEmailError(err); return }
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/forgot-password', { email })
      setResetToken(data.resetToken)
      toast.success(data.message || 'Reset token generated')
    } catch (err) {
      const msg = err.response?.data?.message || (err.request ? 'Unable to connect to server' : err.message)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <HiMail className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email to get a reset token</p>
        </div>

        {resetToken ? (
          <div className="space-y-4">
            <Card className="bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <HiKey className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">Your Reset Token</p>
                  <p className="text-xs text-amber-700 mb-2">
                    Copy this token and use it on the Reset Password page. Token expires in 10 minutes.
                  </p>
                  <code className="block bg-white border border-amber-300 rounded-lg p-3 text-xs text-gray-800 break-all select-all">
                    {resetToken}
                  </code>
                </div>
              </div>
            </Card>
            <Link to="/reset-password">
              <Button className="w-full" size="lg">Go to Reset Password</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormInput
              label="Email address"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
              error={emailError}
              required
              autoComplete="email"
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Get Reset Token
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
