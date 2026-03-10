import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiUser, HiDocumentText, HiKey, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const quickActions = [
  { to: '/student/profile', icon: HiUser, label: 'My Profile', color: 'bg-blue-50 text-blue-600', desc: 'View and update your profile' },
  { to: '/student/documents', icon: HiDocumentText, label: 'Documents', color: 'bg-green-50 text-green-600', desc: 'Upload and manage documents' },
  { to: '/student/change-password', icon: HiKey, label: 'Change Password', color: 'bg-amber-50 text-amber-600', desc: 'Update your password' },
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ profileComplete: null, docCount: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchStats = async () => {
      try {
        const [profileRes, docsRes] = await Promise.allSettled([
          api.get('/api/profile/me'),
          api.get('/api/documents/mine'),
        ])
        if (!mounted) return
        const hasProfile = profileRes.status === 'fulfilled'
        const docCount = docsRes.status === 'fulfilled' ? (docsRes.value.data?.length ?? 0) : 0
        setStats({ profileComplete: hasProfile, docCount })
      } catch {
        // stats are optional — ignore errors
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchStats()
    return () => { mounted = false }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here&apos;s an overview of your placement portal activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="flex items-center gap-4">
          {loading ? (
            <LoadingSpinner size="md" />
          ) : stats.profileComplete ? (
            <HiCheckCircle className="h-10 w-10 text-green-500 flex-shrink-0" />
          ) : (
            <HiExclamationCircle className="h-10 w-10 text-amber-500 flex-shrink-0" />
          )}
          <div>
            <p className="text-sm text-gray-500">Profile Status</p>
            {loading ? (
              <p className="text-lg font-semibold text-gray-400">Loading…</p>
            ) : (
              <p className={`text-lg font-semibold ${stats.profileComplete ? 'text-green-600' : 'text-amber-600'}`}>
                {stats.profileComplete ? 'Profile Created' : 'Not Set Up'}
              </p>
            )}
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <HiDocumentText className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Uploaded Documents</p>
            {loading ? (
              <p className="text-lg font-semibold text-gray-400">Loading…</p>
            ) : (
              <p className="text-2xl font-bold text-gray-900">{stats.docCount}</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map(({ to, icon: Icon, label, color, desc }) => (
            <Link key={to} to={to}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {label}
                </p>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
