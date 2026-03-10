import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { HiUpload, HiTrash, HiDownload, HiDocumentText, HiExclamationCircle } from 'react-icons/hi'
import api from '../../api/axios'
import { DOCUMENT_CATEGORIES } from '../../utils/constants'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function StudentDocuments() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [file, setFile] = useState(null)
  const [category, setCategory] = useState('')
  const [formError, setFormError] = useState('')

  const fetchDocs = async () => {
    try {
      const { data } = await api.get('/api/documents/mine')
      setDocuments(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) { setFormError('Please select a file'); return }
    if (!category) { setFormError('Please select a category'); return }
    setFormError('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)
      await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Document uploaded successfully!')
      setFile(null)
      setCategory('')
      e.target.reset()
      fetchDocs()
    } catch (err) {
      const msg = err.response?.data?.message || (err.request ? 'Unable to connect to server' : err.message)
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/api/documents/${deleteTarget._id}`)
      toast.success('Document deleted')
      setDocuments((prev) => prev.filter((d) => d._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete document')
    } finally {
      setDeleting(false)
    }
  }

  const getCategoryLabel = (val) =>
    DOCUMENT_CATEGORIES.find((c) => c.value === val)?.label || val

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        <p className="text-gray-500 text-sm mt-1">Upload and manage your placement documents</p>
      </div>

      {/* Upload Form */}
      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Upload New Document</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setFormError('') }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select category</option>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                onChange={(e) => { setFile(e.target.files[0]); setFormError('') }}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors"
              />
            </div>
          </div>
          {formError && (
            <p className="flex items-center gap-1 text-sm text-red-600">
              <HiExclamationCircle className="h-4 w-4" /> {formError}
            </p>
          )}
          <Button type="submit" loading={uploading} size="md">
            <HiUpload className="h-4 w-4" /> Upload Document
          </Button>
        </form>
      </Card>

      {/* Documents List */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Uploaded Documents ({documents.length})
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : documents.length === 0 ? (
          <Card className="text-center py-12">
            <HiDocumentText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No documents uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">Use the form above to upload your first document</p>
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
                  <div className="flex items-center gap-2 mt-2">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm">
                        <HiDownload className="h-3.5 w-3.5" /> View
                      </Button>
                    </a>
                    <Button variant="danger" size="sm" onClick={() => setDeleteTarget(doc)}>
                      <HiTrash className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Document"
      >
        <p className="text-gray-600 text-sm mb-4">
          Are you sure you want to delete <strong>{deleteTarget?.fileName}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
