import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { HiKey } from 'react-icons/hi'
import api from '../../api/axios'
import FormInput from '../../components/common/FormInput'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function ChangePassword() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.oldPassword) errs.oldPassword = 'Current password is required'
    if (!form.newPassword) errs.newPassword = 'New password is required'
    else if (form.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters'
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (form.oldPassword && form.oldPassword === form.newPassword)
      errs.newPassword = 'New password must be different from current password'
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
      const { data } = await api.post('/api/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      toast.success(data.message || 'Password changed successfully!')
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      const msg = err.response?.data?.message || (err.request ? 'Unable to connect to server' : err.message)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        <p className="text-gray-500 text-sm mt-1">Update your account password</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center">
            <HiKey className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Security Update</p>
            <p className="text-xs text-gray-500">Choose a strong password with at least 6 characters</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormInput
            label="Current Password" id="oldPassword" name="oldPassword" type="password"
            placeholder="Your current password" value={form.oldPassword}
            onChange={handleChange} error={errors.oldPassword} required
            autoComplete="current-password"
          />
          <FormInput
            label="New Password" id="newPassword" name="newPassword" type="password"
            placeholder="Min. 6 characters" value={form.newPassword}
            onChange={handleChange} error={errors.newPassword} required
            autoComplete="new-password"
          />
          <FormInput
            label="Confirm New Password" id="confirmPassword" name="confirmPassword"
            type="password" placeholder="Repeat new password" value={form.confirmPassword}
            onChange={handleChange} error={errors.confirmPassword} required
            autoComplete="new-password"
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  )
}
