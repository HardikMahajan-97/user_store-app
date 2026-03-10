import { Link } from 'react-router-dom'
import { HiHome } from 'react-icons/hi'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-primary-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg">
            <HiHome className="h-5 w-5" /> Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
