import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { HiLockClosed } from 'react-icons/hi'
import api from '../../api/axios'
import FormInput from '../../components/common/FormInput'
import Button from '../../components/ui/Button'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ token: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.token.trim()) errs.token = 'Reset token is required'
    if (!form.newPassword) errs.newPassword = 'New password is required'
    else if (form.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters'
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/reset-password', {
        token: form.token,
        newPassword: form.newPassword,
      })
      toast.success(data.message || 'Password reset successfully')
      navigate('/login')
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
            <HiLockClosed className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your reset token and new password</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
              Reset Token <span className="text-red-500">*</span>
            </label>
            <textarea
              id="token"
              name="token"
              rows={3}
              placeholder="Paste your reset token here"
              value={form.token}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
                errors.token ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.token && <p className="mt-1 text-xs text-red-600">{errors.token}</p>}
          </div>
          <FormInput
            label="New Password" id="newPassword" name="newPassword" type="password"
            placeholder="Min. 6 characters" value={form.newPassword}
            onChange={handleChange} error={errors.newPassword} required
          />
          <FormInput
            label="Confirm New Password" id="confirmPassword" name="confirmPassword"
            type="password" placeholder="Repeat password" value={form.confirmPassword}
            onChange={handleChange} error={errors.confirmPassword} required
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Reset Password
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
