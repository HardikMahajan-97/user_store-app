import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { HiSearch, HiDocumentText, HiDownload } from 'react-icons/hi'
import api from '../../api/axios'
import { DOCUMENT_CATEGORIES } from '../../utils/constants'
import FormInput from '../../components/common/FormInput'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function StudentDocuments() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState(null)

  const getCategoryLabel = (val) =>
    DOCUMENT_CATEGORIES.find((c) => c.value === val)?.label || val

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setEmailError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email'); return }
    setEmailError('')
    setLoading(true)
    setDocuments(null)
    try {
      const { data } = await api.get(`/api/documents/student/${encodeURIComponent(email.trim())}`)
      setDocuments(data)
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
        <h1 className="text-2xl font-bold text-gray-900">Student Documents</h1>
        <p className="text-gray-500 text-sm mt-1">View all documents uploaded by a student</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <FormInput
              id="doc-email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
              error={emailError}
            />
          </div>
          <Button type="submit" loading={loading} className="flex-shrink-0">
            <HiSearch className="h-4 w-4" /> Fetch Documents
          </Button>
        </form>
      </Card>

      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {documents && !loading && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            <strong>{documents.length}</strong> document(s) found for <strong>{email}</strong>
          </p>

          {documents.length === 0 ? (
            <Card className="text-center py-10">
              <HiDocumentText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No documents found</p>
              <p className="text-sm text-gray-400 mt-1">This student has not uploaded any documents yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <Card key={doc._id} className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiDocumentText className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{doc.fileName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getCategoryLabel(doc.category)} · {formatDate(doc.uploadedAt)}
                    </p>
                    <div className="mt-2">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" size="sm">
                          <HiDownload className="h-3.5 w-3.5" /> View / Download
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
