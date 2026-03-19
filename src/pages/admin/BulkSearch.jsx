import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { HiSearch, HiUser } from 'react-icons/hi'
import api from '../../api/axios'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function BulkSearch() {
  const [emailsInput, setEmailsInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [inputError, setInputError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    const emails = emailsInput
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter(Boolean)

    if (emails.length === 0) { setInputError('Enter at least one email address'); return }

    const invalid = emails.filter((em) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))
    if (invalid.length > 0) {
      setInputError(`Invalid email(s): ${invalid.slice(0, 3).join(', ')}${invalid.length > 3 ? '…' : ''}`)
      return
    }

    setInputError('')
    setLoading(true)
    setResults(null)
    try {
      const { data } = await api.post('/api/profile/students/bulk', { emails })
      setResults(data.profiles ?? [])
    } catch (err) {
      const msg = err.response?.data?.message || (err.request ? 'Unable to connect to server' : err.message)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Student Search</h1>
        <p className="text-gray-500 text-sm mt-1">
          Search multiple student profiles at once using email addresses
        </p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Addresses <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={emailsInput}
              onChange={(e) => { setEmailsInput(e.target.value); setInputError('') }}
              placeholder="Enter emails separated by commas or new lines&#10;student1@example.com&#10;student2@example.com"
              className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
                inputError ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {inputError && <p className="mt-1 text-xs text-red-600">{inputError}</p>}
          </div>
          <Button type="submit" loading={loading}>
            <HiSearch className="h-4 w-4" /> Search Profiles
          </Button>
        </form>
      </Card>

      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {results && !loading && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Found <strong>{results.length}</strong> profile(s)
          </p>

          {results.length === 0 ? (
            <Card className="text-center py-10">
              <HiUser className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No profiles found</p>
              <p className="text-sm text-gray-400 mt-1">None of the provided emails have profiles</p>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Name / Email', 'Institution', 'Degree', 'Branch', 'CGPA', 'Grad Year', 'Skills'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((p) => (
                    <tr key={p._id || p.student} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{p.student?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{p.student?.email || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.institution || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{p.degree || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{p.branch || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{p.cgpa || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{p.graduationYear || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {p.skills?.slice(0, 4).map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded text-xs">{s}</span>
                          ))}
                          {p.skills?.length > 4 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">+{p.skills.length - 4}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}