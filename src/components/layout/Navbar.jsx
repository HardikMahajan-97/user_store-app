import { Link } from 'react-router-dom'
import { HiMenu, HiLogout, HiUser } from 'react-icons/hi'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../utils/constants'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()

  const roleColor =
    user?.role === ROLES.ADMIN
      ? 'bg-amber-100 text-amber-700'
      : 'bg-primary-100 text-primary-700'

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <HiMenu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">US</span>
          </div>
          <span className="font-semibold text-gray-900 hidden sm:block">User Store</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
            <HiUser className="h-4 w-4 text-gray-600" />
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900 leading-none">{user?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
          </div>
        </div>
        <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColor}`}>
          {user?.role}
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Logout"
        >
          <HiLogout className="h-4 w-4" />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </nav>
  )
}
