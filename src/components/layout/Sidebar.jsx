import { NavLink } from 'react-router-dom'
import {
  HiHome,
  HiUser,
  HiDocumentText,
  HiKey,
  HiSearch,
  HiUsers,
  HiFolder,
  HiX,
} from 'react-icons/hi'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../utils/constants'

const studentLinks = [
  { to: '/student/dashboard', icon: HiHome, label: 'Dashboard' },
  { to: '/student/profile', icon: HiUser, label: 'My Profile' },
  { to: '/student/documents', icon: HiDocumentText, label: 'Documents' },
  { to: '/student/change-password', icon: HiKey, label: 'Change Password' },
]

const adminLinks = [
  { to: '/admin/dashboard', icon: HiHome, label: 'Dashboard' },
  { to: '/admin/student-search', icon: HiSearch, label: 'Student Search' },
  { to: '/admin/bulk-search', icon: HiUsers, label: 'Bulk Search' },
  { to: '/admin/student-documents', icon: HiFolder, label: 'Student Documents' },
  { to: '/admin/change-password', icon: HiKey, label: 'Change Password' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const links = user?.role === ROLES.ADMIN ? adminLinks : studentLinks

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden">
          <span className="font-semibold text-gray-900">Navigation</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
            {user?.role === ROLES.ADMIN ? 'Admin Panel' : 'Student Portal'}
          </p>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
