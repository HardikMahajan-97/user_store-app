import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../utils/constants'
import FormInput from '../../components/common/FormInput'
import Button from '../../components/ui/Button'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Other',
]

export default function Register() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', city: '', state: '', role: ROLES.STUDENT,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    const dest = user?.role === ROLES.ADMIN ? '/admin/dashboard' : '/student/dashboard'
    navigate(dest, { replace: true })
    return null
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.phone) errs.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit phone number'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.state) errs.state = 'State is required'
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
      const { name, email, password, phone, city, state, role } = form
      const { data } = await api.post('/api/auth/register', { name, email, password, phone, city, state, role })
      login({ id: data.id, name: data.name, email: data.email, role: data.role }, data.token)
      const dest = data.role === ROLES.ADMIN ? '/admin/dashboard' : '/student/dashboard'
      navigate(dest, { replace: true })
      toast.success('Account created successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || (err.request ? 'Unable to connect to server' : err.message)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">US</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the Placement Management System</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Full Name" id="name" name="name" type="text"
              placeholder="John Doe" value={form.name} onChange={handleChange}
              error={errors.name} required />
            <FormInput label="Email address" id="email" name="email" type="email"
              placeholder="you@example.com" value={form.email} onChange={handleChange}
              error={errors.email} required />
            <FormInput label="Password" id="password" name="password" type="password"
              placeholder="Min. 6 characters" value={form.password} onChange={handleChange}
              error={errors.password} required />
            <FormInput label="Confirm Password" id="confirmPassword" name="confirmPassword"
              type="password" placeholder="Repeat password" value={form.confirmPassword}
              onChange={handleChange} error={errors.confirmPassword} required />
            <FormInput label="Phone Number" id="phone" name="phone" type="tel"
              placeholder="10-digit number" value={form.phone} onChange={handleChange}
              error={errors.phone} required maxLength={10} />
            <FormInput label="City" id="city" name="city" type="text"
              placeholder="Your city" value={form.city} onChange={handleChange}
              error={errors.city} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state" name="state" value={form.state} onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.state ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role" name="role" value={form.role} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={ROLES.STUDENT}>Student</option>
                <option value={ROLES.ADMIN}>Admin</option>
              </select>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
