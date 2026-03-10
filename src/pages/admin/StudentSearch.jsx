import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { HiSearch, HiUser, HiCode, HiBriefcase, HiAcademicCap } from 'react-icons/hi'
import api from '../../api/axios'
import FormInput from '../../components/common/FormInput'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function ProfileDisplay({ profile }) {
  return (
    <div className="space-y-4 mt-6">
      {/* Basic */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <HiUser className="h-4 w-4 text-primary-600" /> Basic Information
        </h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            ['Date of Birth', profile.dateOfBirth],
            ['Address', profile.address],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-gray-500">{k}</dt>
              <dd className="font-medium text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Academic */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <HiAcademicCap className="h-4 w-4 text-primary-600" /> Academic Information
        </h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            ['Institution', profile.institution],
            ['Degree', profile.degree],
            ['Branch', profile.branch],
            ['CGPA', profile.cgpa],
            ['Graduation Year', profile.graduationYear],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-gray-500">{k}</dt>
              <dd className="font-medium text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Skills */}
      {profile.skills?.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <HiCode className="h-4 w-4 text-primary-600" /> Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s, i) => (
              <span key={i} className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">{s}</span>
            ))}
          </div>
        </Card>
      )}

      {/* Coding Profiles */}
      {profile.codingProfiles?.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Coding Profiles</h3>
          <div className="space-y-2">
            {profile.codingProfiles.map((cp, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="font-medium text-gray-700 w-24 flex-shrink-0">{cp.platform}</span>
                <span className="text-gray-500">{cp.username}</span>
                {cp.profileLink && (
                  <a href={cp.profileLink} target="_blank" rel="noopener noreferrer"
                    className="text-primary-600 hover:underline text-xs ml-auto">View ↗</a>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Projects */}
      {profile.projects?.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Projects</h3>
          <div className="space-y-3">
            {profile.projects.map((p, i) => (
              <div key={i} className="border-l-2 border-primary-200 pl-3">
                <p className="font-medium text-gray-900 text-sm">{p.title}</p>
                {p.description && <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>}
                {p.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(Array.isArray(p.technologies) ? p.technologies : [p.technologies]).map((t, j) => (
                      <span key={j} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Experience */}
      {profile.experience?.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <HiBriefcase className="h-4 w-4 text-primary-600" /> Experience
          </h3>
          <div className="space-y-3">
            {profile.experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-primary-200 pl-3">
                <p className="font-medium text-gray-900 text-sm">{exp.role} @ {exp.company}</p>
                <p className="text-xs text-gray-500">{exp.duration}</p>
                {exp.description && <p className="text-xs text-gray-400 mt-0.5">{exp.description}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Achievements */}
      {profile.achievements?.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Achievements</h3>
          <ul className="list-disc list-inside space-y-1">
            {profile.achievements.map((a, i) => (
              <li key={i} className="text-sm text-gray-700">{a}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

export default function StudentSearch() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setEmailError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email'); return }
    setEmailError('')
    setLoading(true)
    setProfile(null)
    setNotFound(false)
    try {
      const { data } = await api.get(`/api/profile/student/${encodeURIComponent(email.trim())}`)
      setProfile(data)
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true)
      } else {
        const msg = err.response?.data?.message || (err.request ? 'Unable to connect to server' : err.message)
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Search</h1>
        <p className="text-gray-500 text-sm mt-1">Look up a student profile by email address</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <FormInput
              id="search-email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
              error={emailError}
            />
          </div>
          <Button type="submit" loading={loading} className="flex-shrink-0">
            <HiSearch className="h-4 w-4" /> Search
          </Button>
        </form>
      </Card>

      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {notFound && !loading && (
        <Card className="text-center py-10">
          <HiUser className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No profile found</p>
          <p className="text-sm text-gray-400 mt-1">No student with email <strong>{email}</strong> has a profile yet</p>
        </Card>
      )}

      {profile && !loading && <ProfileDisplay profile={profile} />}
    </div>
  )
}
