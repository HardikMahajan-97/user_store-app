import { Link } from 'react-router-dom'
import { HiSearch, HiUsers, HiFolder } from 'react-icons/hi'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/ui/Card'

const quickActions = [
  {
    to: '/admin/student-search',
    icon: HiSearch,
    label: 'Search Student',
    color: 'bg-blue-50 text-blue-600',
    desc: 'Look up a student by email address',
  },
  {
    to: '/admin/bulk-search',
    icon: HiUsers,
    label: 'Bulk Search',
    color: 'bg-purple-50 text-purple-600',
    desc: 'Search multiple students at once',
  },
  {
    to: '/admin/student-documents',
    icon: HiFolder,
    label: 'Student Documents',
    color: 'bg-green-50 text-green-600',
    desc: 'View documents uploaded by a student',
  },
]

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Admin Panel — Manage student profiles and documents
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-2xl">🛡️</span>
        <div>
          <p className="font-semibold text-amber-800 text-sm">Admin Access</p>
          <p className="text-amber-700 text-xs mt-0.5">
            You have admin privileges. Handle student data responsibly.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Tools</h2>
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
