import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { HiPlus, HiTrash } from 'react-icons/hi'
import api from '../../api/axios'
import FormInput from '../../components/common/FormInput'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const emptyProfile = {
  dateOfBirth: '', address: '', institution: '', degree: '',
  branch: '', cgpa: '', graduationYear: '',
  codingProfiles: [],
  professionalProfiles: [],
  skills: [],
  projects: [],
  experience: [],
  achievements: [],
}

const emptyCoP = { platform: '', username: '', profileLink: '', rating: '' }
const emptyProP = { platform: '', link: '' }
const emptyProject = { title: '', description: '', technologies: '', link: '' }
const emptyExp = { company: '', role: '', duration: '', description: '' }

function Section({ title, children }) {
  return (
    <Card className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">{title}</h2>
      {children}
    </Card>
  )
}

function TagInput({ label, tags, onAdd, onRemove }) {
  const [input, setInput] = useState('')
  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      onAdd(input.trim())
      setInput('')
    }
  }
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
            {tag}
            <button type="button" onClick={() => onRemove(i)} className="text-primary-400 hover:text-red-500">
              <HiTrash className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type and press Enter or comma to add"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  )
}

export default function StudentProfile() {
  const [profile, setProfile] = useState(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    api.get('/api/profile/me')
      .then(({ data }) => {
        if (!mounted) return
        setProfile({
          ...emptyProfile,
          ...data,
          codingProfiles: data.codingProfiles || [],
          professionalProfiles: data.professionalProfiles || [],
          skills: data.skills || [],
          projects: data.projects || [],
          experience: data.experience || [],
          achievements: data.achievements || [],
        })
      })
      .catch(() => { /* no profile yet — use defaults */ })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const setField = (field, value) => setProfile((p) => ({ ...p, [field]: value }))
  const setListItem = (field, index, key, value) =>
    setProfile((p) => {
      const arr = [...p[field]]
      arr[index] = { ...arr[index], [key]: value }
      return { ...p, [field]: arr }
    })
  const addToList = (field, empty) => setProfile((p) => ({ ...p, [field]: [...p[field], { ...empty }] }))
  const removeFromList = (field, index) => setProfile((p) => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...profile,
        projects: profile.projects.map((p) => ({
          ...p,
          technologies: typeof p.technologies === 'string'
            ? p.technologies.split(',').map((t) => t.trim()).filter(Boolean)
            : p.technologies,
        })),
      }
      await api.put('/api/profile/update', payload)
      toast.success('Profile saved successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || (err.request ? 'Unable to connect to server' : err.message)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Keep your placement profile up to date</p>
        </div>
        <Button type="submit" loading={saving} size="lg">Save Profile</Button>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Date of Birth" id="dob" type="date" value={profile.dateOfBirth}
            onChange={(e) => setField('dateOfBirth', e.target.value)} />
          <FormInput label="Address" id="address" type="text" placeholder="Your address"
            value={profile.address} onChange={(e) => setField('address', e.target.value)} />
        </div>
      </Section>

      {/* Academic Info */}
      <Section title="Academic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Institution" id="institution" type="text" placeholder="College / University"
            value={profile.institution} onChange={(e) => setField('institution', e.target.value)} />
          <FormInput label="Degree" id="degree" type="text" placeholder="e.g. B.Tech"
            value={profile.degree} onChange={(e) => setField('degree', e.target.value)} />
          <FormInput label="Branch" id="branch" type="text" placeholder="e.g. Computer Science"
            value={profile.branch} onChange={(e) => setField('branch', e.target.value)} />
          <FormInput label="CGPA" id="cgpa" type="text" placeholder="e.g. 8.5"
            value={profile.cgpa} onChange={(e) => setField('cgpa', e.target.value)} />
          <FormInput label="Graduation Year" id="gradYear" type="text" placeholder="e.g. 2025"
            value={profile.graduationYear} onChange={(e) => setField('graduationYear', e.target.value)} />
        </div>
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <TagInput
          tags={profile.skills}
          onAdd={(t) => setField('skills', [...profile.skills, t])}
          onRemove={(i) => setField('skills', profile.skills.filter((_, idx) => idx !== i))}
        />
      </Section>

      {/* Coding Profiles */}
      <Section title="Coding Profiles">
        <div className="space-y-4">
          {profile.codingProfiles.map((cp, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
              <button type="button" onClick={() => removeFromList('codingProfiles', i)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                <HiTrash className="h-4 w-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput label="Platform" type="text" placeholder="e.g. LeetCode" value={cp.platform}
                  onChange={(e) => setListItem('codingProfiles', i, 'platform', e.target.value)} />
                <FormInput label="Username" type="text" placeholder="Your handle" value={cp.username}
                  onChange={(e) => setListItem('codingProfiles', i, 'username', e.target.value)} />
                <FormInput label="Profile Link" type="url" placeholder="https://..." value={cp.profileLink}
                  onChange={(e) => setListItem('codingProfiles', i, 'profileLink', e.target.value)} />
                <FormInput label="Rating / Score" type="text" placeholder="Optional" value={cp.rating}
                  onChange={(e) => setListItem('codingProfiles', i, 'rating', e.target.value)} />
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => addToList('codingProfiles', emptyCoP)}>
            <HiPlus className="h-4 w-4" /> Add Coding Profile
          </Button>
        </div>
      </Section>

      {/* Professional Profiles */}
      <Section title="Professional Profiles">
        <div className="space-y-4">
          {profile.professionalProfiles.map((pp, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
              <button type="button" onClick={() => removeFromList('professionalProfiles', i)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                <HiTrash className="h-4 w-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput label="Platform" type="text" placeholder="e.g. LinkedIn" value={pp.platform}
                  onChange={(e) => setListItem('professionalProfiles', i, 'platform', e.target.value)} />
                <FormInput label="Profile Link" type="url" placeholder="https://..." value={pp.link}
                  onChange={(e) => setListItem('professionalProfiles', i, 'link', e.target.value)} />
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => addToList('professionalProfiles', emptyProP)}>
            <HiPlus className="h-4 w-4" /> Add Professional Profile
          </Button>
        </div>
      </Section>

      {/* Projects */}
      <Section title="Projects">
        <div className="space-y-4">
          {profile.projects.map((proj, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
              <button type="button" onClick={() => removeFromList('projects', i)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                <HiTrash className="h-4 w-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput label="Title" type="text" placeholder="Project name" value={proj.title}
                  onChange={(e) => setListItem('projects', i, 'title', e.target.value)} />
                <FormInput label="Project Link" type="url" placeholder="https://..." value={proj.link}
                  onChange={(e) => setListItem('projects', i, 'link', e.target.value)} />
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={2} placeholder="Describe the project" value={proj.description}
                    onChange={(e) => setListItem('projects', i, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <FormInput label="Technologies (comma-separated)" type="text"
                    placeholder="React, Node.js, MongoDB" value={
                      Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies
                    }
                    onChange={(e) => setListItem('projects', i, 'technologies', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => addToList('projects', emptyProject)}>
            <HiPlus className="h-4 w-4" /> Add Project
          </Button>
        </div>
      </Section>

      {/* Experience */}
      <Section title="Work Experience">
        <div className="space-y-4">
          {profile.experience.map((exp, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
              <button type="button" onClick={() => removeFromList('experience', i)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                <HiTrash className="h-4 w-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput label="Company" type="text" placeholder="Company name" value={exp.company}
                  onChange={(e) => setListItem('experience', i, 'company', e.target.value)} />
                <FormInput label="Role" type="text" placeholder="Job title" value={exp.role}
                  onChange={(e) => setListItem('experience', i, 'role', e.target.value)} />
                <FormInput label="Duration" type="text" placeholder="e.g. Jun 2023 – Aug 2023" value={exp.duration}
                  onChange={(e) => setListItem('experience', i, 'duration', e.target.value)} />
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={2} placeholder="Describe your responsibilities" value={exp.description}
                    onChange={(e) => setListItem('experience', i, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => addToList('experience', emptyExp)}>
            <HiPlus className="h-4 w-4" /> Add Experience
          </Button>
        </div>
      </Section>

      {/* Achievements */}
      <Section title="Achievements">
        <div className="space-y-2">
          {profile.achievements.map((ach, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={ach} placeholder="Describe an achievement"
                onChange={(e) => {
                  const arr = [...profile.achievements]
                  arr[i] = e.target.value
                  setField('achievements', arr)
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="button" onClick={() => removeFromList('achievements', i)}
                className="text-red-400 hover:text-red-600 p-1">
                <HiTrash className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm"
            onClick={() => setField('achievements', [...profile.achievements, ''])}>
            <HiPlus className="h-4 w-4" /> Add Achievement
          </Button>
        </div>
      </Section>

      <div className="flex justify-end pb-6">
        <Button type="submit" loading={saving} size="lg">Save Profile</Button>
      </div>
    </form>
  )
}
