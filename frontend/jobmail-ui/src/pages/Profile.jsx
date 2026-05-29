import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBriefcase,
  faFloppyDisk,
  faFolderOpen,
  faGraduationCap,
  faPlus,
  faTrash,
  faUpload,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import api from '../services/api.js'

const emptyProfile = {
  fullName: '',
  currentRole: '',
  yearsOfExperience: 0,
  location: '',
  objective: '',
  skills: '',
  phoneNumber: '',
  linkedInUrl: '',
  gitHubUrl: '',
  portfolioUrl: '',
  cvLink: '',
  cvFileName: '',
  currentCompany: '',
  noticePeriod: '',
  preferredRoles: '',
  preferredLocations: '',
  workAuthorization: '',
  experience: [],
  projects: [],
  education: [],
  achievements: '',
  openSourceContributions: '',
  cvRawText: '',
}

const emptyExperience = {
  company: '',
  role: '',
  duration: '',
  keyAchievements: '',
}

const emptyProject = {
  name: '',
  description: '',
  techStack: '',
  link: '',
}

const emptyEducation = {
  degree: '',
  college: '',
  year: '',
}

const cityOptions = [
  'Bangalore',
  'Mumbai',
  'Pune',
  'Delhi',
  'Gurugram',
  'Noida',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Kochi',
  'Indore',
  'Lucknow',
  'Chandigarh',
  'Surat',
  'Nagpur',
  'Bhopal',
  'Patna',
  'Coimbatore',
  'Remote',
]

const roleOptions = [
  'Software Engineer',
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'Data Analyst',
  'Data Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'QA Engineer',
  'SRE',
  'Product Manager',
  'Project Manager',
  'Business Analyst',
  'UX Designer',
  'UI Designer',
  'Cloud Engineer',
  'Solutions Architect',
]

const initialEditingState = {
  personal: false,
  summary: false,
  preferences: false,
  experience: false,
  projects: false,
  education: false,
  highlights: false,
  documents: false,
}

export default function Profile() {
  const [form, setForm] = useState(emptyProfile)
  const [status, setStatus] = useState({ loading: true, saving: false, error: '' })
  const [notice, setNotice] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState({ ...initialEditingState })

  const toggleEditing = (section) => {
    setEditing((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const applyProfile = (data) => {
    setForm({
      ...emptyProfile,
      ...data,
      experience: data.experience || [],
      projects: data.projects || [],
      education: data.education || [],
    })
  }

  useEffect(() => {
    const loadProfile = async () => {
      setStatus({ loading: true, saving: false, error: '' })
      setNotice(null)
      try {
        const { data } = await api.get('/api/profile')
        if (data) {
          applyProfile(data)
        } else {
          setForm(emptyProfile)
        }
        setEditing({ ...initialEditingState })
        setStatus({ loading: false, saving: false, error: '' })
      } catch {
        setStatus({ loading: false, saving: false, error: 'Unable to load profile.' })
      }
    }

    loadProfile()
  }, [])

  const handleFieldChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const updateListItem = (listName, index, field) => (event) => {
    const value = event.target.value
    setForm((prev) => {
      const nextList = [...prev[listName]]
      nextList[index] = { ...nextList[index], [field]: value }
      return { ...prev, [listName]: nextList }
    })
  }

  const addListItem = (listName, template) => {
    setForm((prev) => ({ ...prev, [listName]: [...prev[listName], template] }))
  }

  const removeListItem = (listName, index) => {
    setForm((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const splitList = (value) =>
    (value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

  const joinList = (items) =>
    (items || [])
      .map((item) => item.trim())
      .filter(Boolean)
      .join(', ')

  const setListItemValue = (listName, index, field, value) => {
    setForm((prev) => {
      const nextList = [...prev[listName]]
      nextList[index] = { ...nextList[index], [field]: value }
      return { ...prev, [listName]: nextList }
    })
  }

  const normalizeDateValue = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : ''

  const normalizeEducationDate = (value) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
      return value
    }
    if (/^\d{4}$/.test(value || '')) {
      return `${value}-01-01`
    }
    return ''
  }

  const getDurationParts = (value) => {
    const [start, end] = (value || '').split(' - ')
    return {
      start: normalizeDateValue(start?.trim()),
      end: normalizeDateValue(end?.trim()),
    }
  }

  const setExperienceDuration = (index, part, value) => {
    setForm((prev) => {
      const nextList = [...prev.experience]
      const current = nextList[index] || emptyExperience
      const parts = getDurationParts(current.duration)
      const nextParts = { ...parts, [part]: value }
      const duration = [nextParts.start, nextParts.end].filter(Boolean).join(' - ')
      nextList[index] = { ...current, duration }
      return { ...prev, experience: nextList }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus((prev) => ({ ...prev, saving: true, error: '' }))
    setNotice(null)
    try {
      const normalizeText = (value) => (value ?? '').toString().trim()
      const normalizeExperience = (items) =>
        (items || []).map((item = {}) => ({
          company: normalizeText(item.company),
          role: normalizeText(item.role),
          duration: normalizeText(item.duration),
          keyAchievements: normalizeText(item.keyAchievements),
        }))
      const normalizeProjects = (items) =>
        (items || []).map((item = {}) => ({
          name: normalizeText(item.name),
          description: normalizeText(item.description),
          techStack: normalizeText(item.techStack),
          link: normalizeText(item.link),
        }))
      const normalizeEducation = (items) =>
        (items || []).map((item = {}) => ({
          degree: normalizeText(item.degree),
          college: normalizeText(item.college),
          year: normalizeText(item.year),
        }))

      const payload = {
        fullName: normalizeText(form.fullName),
        currentRole: normalizeText(form.currentRole),
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
        location: normalizeText(form.location),
        objective: normalizeText(form.objective),
        skills: normalizeText(form.skills),
        phoneNumber: normalizeText(form.phoneNumber),
        linkedInUrl: normalizeText(form.linkedInUrl),
        gitHubUrl: normalizeText(form.gitHubUrl),
        portfolioUrl: normalizeText(form.portfolioUrl),
        cvLink: normalizeText(form.cvLink),
        currentCompany: normalizeText(form.currentCompany),
        noticePeriod: normalizeText(form.noticePeriod),
        preferredRoles: normalizeText(form.preferredRoles),
        preferredLocations: normalizeText(form.preferredLocations),
        workAuthorization: normalizeText(form.workAuthorization),
        experience: normalizeExperience(form.experience),
        projects: normalizeProjects(form.projects),
        education: normalizeEducation(form.education),
        achievements: normalizeText(form.achievements),
        openSourceContributions: normalizeText(form.openSourceContributions),
        cvRawText: normalizeText(form.cvRawText),
      }

      const { data } = await api.put('/api/profile', payload)
      if (data) {
        applyProfile(data)
      }
      setStatus((prev) => ({ ...prev, saving: false, error: '' }))
      setNotice({ type: 'success', text: 'Profile saved.' })
      setEditing({ ...initialEditingState })
    } catch {
      setStatus((prev) => ({ ...prev, saving: false, error: 'Save failed. Try again.' }))
    }
  }

  const handleCvUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    setNotice(null)

    try {
      const { data } = await api.post('/api/profile/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setNotice({ type: 'success', text: 'CV uploaded. It will be attached to emails.' })
      setForm((prev) => ({
        ...prev,
        cvFileName: data?.fileName || file.name,
      }))
    } catch (err) {
      setNotice({
        type: 'error',
        text: err?.response?.data?.message || 'CV upload failed.',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleCvDownload = async () => {
    if (!form.cvFileName) {
      return
    }

    try {
      const response = await api.get('/api/profile/cv', { responseType: 'blob' })
      const fileUrl = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = form.cvFileName || 'cv.pdf'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(fileUrl), 10000)
    } catch (err) {
      setNotice({
        type: 'error',
        text: err?.response?.data?.message || 'Unable to download CV.',
      })
    }
  }

  if (status.loading) {
    return (
      <Paper variant="outlined" sx={{ p: 3, border: 0, borderRadius: 0 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={20} />
          <Typography>Loading profile...</Typography>
        </Stack>
      </Paper>
    )
  }

  const sectionHeader = (title, sectionKey, subtitle) => (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
    >
      <Box>
        <Typography variant="h6" sx={sectionHeadingSx}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography
          variant="caption"
          color={editing[sectionKey] ? 'primary.main' : 'text.secondary'}
        >
          {editing[sectionKey] ? 'Editing enabled' : 'Read only'}
        </Typography>
        <Button
          size="small"
          variant={editing[sectionKey] ? 'contained' : 'outlined'}
          onClick={() => toggleEditing(sectionKey)}
          sx={{ textTransform: 'none' }}
        >
          {editing[sectionKey] ? 'Done' : 'Edit'}
        </Button>
      </Stack>
    </Stack>
  )

  const personalLocked = !editing.personal
  const summaryLocked = !editing.summary
  const preferencesLocked = !editing.preferences
  const experienceLocked = !editing.experience
  const projectsLocked = !editing.projects
  const educationLocked = !editing.education
  const highlightsLocked = !editing.highlights
  const documentsLocked = !editing.documents

  const lockedFieldProps = (locked, inputProps) => ({
    InputProps: { ...(inputProps || {}), readOnly: locked },
    sx: {
      '& .MuiInputBase-root': {
        bgcolor: locked ? '#ffffff' : 'transparent',
      },
    },
  })

  const sectionPaperSx = {
    p: { xs: 2, md: 3 },
    border: 0,
    borderRadius: 0,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
  }
  const itemPaperSx = {
    p: 2,
    border: 0,
    borderRadius: 0,
    boxShadow: 'none',
    bgcolor: 'rgba(0, 0, 0, 0.02)',
  }
  const mainHeadingSx = {
    display: 'inline-flex',
    alignItems: 'center',
    px: 2,
    py: 0.5,
    borderRadius: '6px',
    bgcolor: '#1e4fa3',
    color: '#ffffff',
    fontWeight: 700,
  }
  const sectionHeadingSx = {
    display: 'inline-flex',
    alignItems: 'center',
    px: 1.5,
    py: 0.25,
    borderRadius: '6px',
    bgcolor: '#f3e8ff',
    color: '#6b21a8',
    fontWeight: 600,
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={mainHeadingSx}>
          Candidate profile
        </Typography>
        <Typography color="text.secondary">This data powers every email draft.</Typography>
      </Box>

      {status.error ? <Alert severity="error">{status.error}</Alert> : null}
      {notice ? <Alert severity={notice.type}>{notice.text}</Alert> : null}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Paper variant="outlined" sx={sectionPaperSx}>
            <Stack spacing={2}>
              {sectionHeader('Personal info', 'personal', 'Basics, role, and contact details.')}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Full name"
                    value={form.fullName}
                    onChange={handleFieldChange('fullName')}
                    placeholder="Your full name"
                    fullWidth
                    {...lockedFieldProps(personalLocked)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    freeSolo
                    options={roleOptions}
                    value={form.currentRole || ''}
                    onChange={(_, value) =>
                      setForm((prev) => ({ ...prev, currentRole: value || '' }))
                    }
                    inputValue={form.currentRole || ''}
                    onInputChange={(_, value) =>
                      setForm((prev) => ({ ...prev, currentRole: value }))
                    }
                    disabled={personalLocked}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Current role"
                        placeholder="Senior Analyst"
                        fullWidth
                        {...lockedFieldProps(personalLocked, params.InputProps)}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Years of experience"
                    type="number"
                    value={form.yearsOfExperience}
                    onChange={handleFieldChange('yearsOfExperience')}
                    inputProps={{ min: 0 }}
                    fullWidth
                    {...lockedFieldProps(personalLocked)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    freeSolo
                    options={cityOptions}
                    value={form.location || ''}
                    onChange={(_, value) =>
                      setForm((prev) => ({ ...prev, location: value || '' }))
                    }
                    inputValue={form.location || ''}
                    onInputChange={(_, value) =>
                      setForm((prev) => ({ ...prev, location: value }))
                    }
                    disabled={personalLocked}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Location"
                        placeholder="City, Country"
                        fullWidth
                        {...lockedFieldProps(personalLocked, params.InputProps)}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Current company"
                    value={form.currentCompany}
                    onChange={handleFieldChange('currentCompany')}
                    placeholder="Company name"
                    fullWidth
                    {...lockedFieldProps(personalLocked)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Notice period"
                    value={form.noticePeriod}
                    onChange={handleFieldChange('noticePeriod')}
                    placeholder="Immediate / 30 days"
                    fullWidth
                    {...lockedFieldProps(personalLocked)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone number"
                    value={form.phoneNumber}
                    onChange={handleFieldChange('phoneNumber')}
                    placeholder="+91..."
                    fullWidth
                    {...lockedFieldProps(personalLocked)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="LinkedIn"
                    value={form.linkedInUrl}
                    onChange={handleFieldChange('linkedInUrl')}
                    placeholder="https://linkedin.com/in/..."
                    fullWidth
                    {...lockedFieldProps(personalLocked)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="GitHub"
                    value={form.gitHubUrl}
                    onChange={handleFieldChange('gitHubUrl')}
                    placeholder="https://github.com/..."
                    fullWidth
                    {...lockedFieldProps(personalLocked)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Portfolio"
                    value={form.portfolioUrl}
                    onChange={handleFieldChange('portfolioUrl')}
                    placeholder="https://"
                    fullWidth
                    {...lockedFieldProps(personalLocked)}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={sectionPaperSx}>
            <Stack spacing={2}>
              {sectionHeader('Summary', 'summary', 'Objective and skills snapshot.')}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Objective"
                    value={form.objective}
                    onChange={handleFieldChange('objective')}
                    placeholder="Short career summary"
                    multiline
                    rows={2}
                    fullWidth
                    {...lockedFieldProps(summaryLocked)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Skills"
                    value={form.skills}
                    onChange={handleFieldChange('skills')}
                    placeholder="Comma separated skills"
                    multiline
                    rows={2}
                    fullWidth
                    {...lockedFieldProps(summaryLocked)}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={sectionPaperSx}>
            <Stack spacing={2}>
              {sectionHeader('Preferences', 'preferences', 'Roles, locations, and work status.')}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={roleOptions}
                    value={splitList(form.preferredRoles)}
                    onChange={(_, value) =>
                      setForm((prev) => ({ ...prev, preferredRoles: joinList(value) }))
                    }
                    disabled={preferencesLocked}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Preferred roles"
                        placeholder="Backend, Data Analyst, etc"
                        fullWidth
                        {...lockedFieldProps(preferencesLocked, params.InputProps)}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={cityOptions}
                    value={splitList(form.preferredLocations)}
                    onChange={(_, value) =>
                      setForm((prev) => ({ ...prev, preferredLocations: joinList(value) }))
                    }
                    disabled={preferencesLocked}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Preferred locations"
                        placeholder="Bangalore, Pune, Remote"
                        fullWidth
                        {...lockedFieldProps(preferencesLocked, params.InputProps)}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Work authorization"
                    value={form.workAuthorization}
                    onChange={handleFieldChange('workAuthorization')}
                    placeholder="India (Citizen), Visa, etc"
                    multiline
                    rows={2}
                    fullWidth
                    {...lockedFieldProps(preferencesLocked)}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={sectionPaperSx}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <FontAwesomeIcon icon={faBriefcase} />
                  <Typography variant="h6" sx={sectionHeadingSx}>
                    Experience
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="caption"
                    color={editing.experience ? 'primary.main' : 'text.secondary'}
                  >
                    {editing.experience ? 'Editing enabled' : 'Read only'}
                  </Typography>
                  <Button
                    size="small"
                    variant={editing.experience ? 'contained' : 'outlined'}
                    onClick={() => toggleEditing('experience')}
                    sx={{ textTransform: 'none' }}
                  >
                    {editing.experience ? 'Done' : 'Edit'}
                  </Button>
                </Stack>
              </Stack>
              {form.experience.length === 0 ? (
                <Typography color="text.secondary">No experience added yet.</Typography>
              ) : null}
              {form.experience.map((item, index) => {
                const durationParts = getDurationParts(item.duration)
                return (
                  <Paper variant="outlined" sx={itemPaperSx} key={`experience-${index}`}>
                    <Stack spacing={2}>
                      <TextField
                        label="Company"
                        value={item.company}
                        onChange={updateListItem('experience', index, 'company')}
                        placeholder="Company name"
                        fullWidth
                        {...lockedFieldProps(experienceLocked)}
                      />
                      <Autocomplete
                        freeSolo
                        options={roleOptions}
                        value={item.role || ''}
                        onChange={(_, value) =>
                          setListItemValue('experience', index, 'role', value || '')
                        }
                        inputValue={item.role || ''}
                        onInputChange={(_, value) =>
                          setListItemValue('experience', index, 'role', value)
                        }
                        disabled={experienceLocked}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Role"
                            placeholder="Role"
                            fullWidth
                            {...lockedFieldProps(experienceLocked, params.InputProps)}
                          />
                        )}
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Start date"
                            type="date"
                            value={durationParts.start}
                            onChange={(event) =>
                              setExperienceDuration(index, 'start', event.target.value)
                            }
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            {...lockedFieldProps(experienceLocked)}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="End date"
                            type="date"
                            value={durationParts.end}
                            onChange={(event) =>
                              setExperienceDuration(index, 'end', event.target.value)
                            }
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            {...lockedFieldProps(experienceLocked)}
                          />
                        </Grid>
                      </Grid>
                      <TextField
                        label="Key achievements"
                        value={item.keyAchievements}
                        onChange={updateListItem('experience', index, 'keyAchievements')}
                        placeholder="Impact highlights"
                        multiline
                        rows={2}
                        fullWidth
                        {...lockedFieldProps(experienceLocked)}
                      />
                      <Button
                        color="error"
                        variant="text"
                        onClick={() => removeListItem('experience', index)}
                        startIcon={<FontAwesomeIcon icon={faTrash} />}
                        sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                        disabled={experienceLocked}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Paper>
                )
              })}
              <Button
                variant="outlined"
                onClick={() => addListItem('experience', emptyExperience)}
                startIcon={<FontAwesomeIcon icon={faPlus} />}
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                disabled={experienceLocked}
              >
                Add experience
              </Button>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={sectionPaperSx}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <FontAwesomeIcon icon={faFolderOpen} />
                  <Typography variant="h6" sx={sectionHeadingSx}>
                    Projects
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="caption"
                    color={editing.projects ? 'primary.main' : 'text.secondary'}
                  >
                    {editing.projects ? 'Editing enabled' : 'Read only'}
                  </Typography>
                  <Button
                    size="small"
                    variant={editing.projects ? 'contained' : 'outlined'}
                    onClick={() => toggleEditing('projects')}
                    sx={{ textTransform: 'none' }}
                  >
                    {editing.projects ? 'Done' : 'Edit'}
                  </Button>
                </Stack>
              </Stack>
              {form.projects.length === 0 ? (
                <Typography color="text.secondary">No projects added yet.</Typography>
              ) : null}
              {form.projects.map((item, index) => (
                <Paper variant="outlined" sx={itemPaperSx} key={`project-${index}`}>
                  <Stack spacing={2}>
                    <TextField
                      label="Name"
                      value={item.name}
                      onChange={updateListItem('projects', index, 'name')}
                      placeholder="Project name"
                      fullWidth
                      {...lockedFieldProps(projectsLocked)}
                    />
                    <TextField
                      label="Description"
                      value={item.description}
                      onChange={updateListItem('projects', index, 'description')}
                      placeholder="What did you build?"
                      multiline
                      rows={2}
                      fullWidth
                      {...lockedFieldProps(projectsLocked)}
                    />
                    <TextField
                      label="Tech stack"
                      value={item.techStack}
                      onChange={updateListItem('projects', index, 'techStack')}
                      placeholder="React, .NET, Postgres"
                      fullWidth
                      {...lockedFieldProps(projectsLocked)}
                    />
                    <TextField
                      label="Link"
                      value={item.link}
                      onChange={updateListItem('projects', index, 'link')}
                      placeholder="https://"
                      fullWidth
                      {...lockedFieldProps(projectsLocked)}
                    />
                    <Button
                      color="error"
                      variant="text"
                      onClick={() => removeListItem('projects', index)}
                      startIcon={<FontAwesomeIcon icon={faTrash} />}
                      sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                      disabled={projectsLocked}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Paper>
              ))}
              <Button
                variant="outlined"
                onClick={() => addListItem('projects', emptyProject)}
                startIcon={<FontAwesomeIcon icon={faPlus} />}
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                disabled={projectsLocked}
              >
                Add project
              </Button>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={sectionPaperSx}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <FontAwesomeIcon icon={faGraduationCap} />
                  <Typography variant="h6" sx={sectionHeadingSx}>
                    Education
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="caption"
                    color={editing.education ? 'primary.main' : 'text.secondary'}
                  >
                    {editing.education ? 'Editing enabled' : 'Read only'}
                  </Typography>
                  <Button
                    size="small"
                    variant={editing.education ? 'contained' : 'outlined'}
                    onClick={() => toggleEditing('education')}
                    sx={{ textTransform: 'none' }}
                  >
                    {editing.education ? 'Done' : 'Edit'}
                  </Button>
                </Stack>
              </Stack>
              {form.education.length === 0 ? (
                <Typography color="text.secondary">No education added yet.</Typography>
              ) : null}
              {form.education.map((item, index) => (
                <Paper variant="outlined" sx={itemPaperSx} key={`education-${index}`}>
                  <Stack spacing={2}>
                    <TextField
                      label="Degree"
                      value={item.degree}
                      onChange={updateListItem('education', index, 'degree')}
                      placeholder="Degree"
                      fullWidth
                      {...lockedFieldProps(educationLocked)}
                    />
                    <TextField
                      label="College"
                      value={item.college}
                      onChange={updateListItem('education', index, 'college')}
                      placeholder="College"
                      fullWidth
                      {...lockedFieldProps(educationLocked)}
                    />
                    <TextField
                      label="Year"
                      type="date"
                      value={normalizeEducationDate(item.year)}
                      onChange={updateListItem('education', index, 'year')}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      {...lockedFieldProps(educationLocked)}
                    />
                    <Button
                      color="error"
                      variant="text"
                      onClick={() => removeListItem('education', index)}
                      startIcon={<FontAwesomeIcon icon={faTrash} />}
                      sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                      disabled={educationLocked}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Paper>
              ))}
              <Button
                variant="outlined"
                onClick={() => addListItem('education', emptyEducation)}
                startIcon={<FontAwesomeIcon icon={faPlus} />}
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                disabled={educationLocked}
              >
                Add education
              </Button>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={sectionPaperSx}>
            <Stack spacing={2}>
              {sectionHeader('Highlights', 'highlights', 'Achievements and open-source work.')}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Achievements"
                    value={form.achievements}
                    onChange={handleFieldChange('achievements')}
                    multiline
                    rows={2}
                    fullWidth
                    {...lockedFieldProps(highlightsLocked)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Open source"
                    value={form.openSourceContributions}
                    onChange={handleFieldChange('openSourceContributions')}
                    multiline
                    rows={2}
                    fullWidth
                    {...lockedFieldProps(highlightsLocked)}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={sectionPaperSx}>
            <Stack spacing={2}>
              {sectionHeader('Documents', 'documents', 'CV links, uploads, and raw text.')}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="CV link"
                    value={form.cvLink}
                    onChange={handleFieldChange('cvLink')}
                    placeholder="Drive/Notion/GitHub CV link"
                    fullWidth
                    {...lockedFieldProps(documentsLocked)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1.5}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<FontAwesomeIcon icon={faUpload} />}
                      disabled={uploading || documentsLocked}
                      sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                    >
                      Upload CV PDF
                      <input type="file" hidden accept=".pdf" onChange={handleCvUpload} />
                    </Button>
                    {form.cvFileName ? (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Typography variant="body2">{form.cvFileName}</Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleCvDownload}
                          sx={{ textTransform: 'none' }}
                        >
                          Download PDF
                        </Button>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No CV uploaded yet.
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Uploaded CV will be attached when you send emails.
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="CV raw text"
                    value={form.cvRawText}
                    onChange={handleFieldChange('cvRawText')}
                    multiline
                    rows={6}
                    fullWidth
                    {...lockedFieldProps(documentsLocked)}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={status.saving}
              startIcon={<FontAwesomeIcon icon={faFloppyDisk} />}
              sx={{ textTransform: 'none' }}
            >
              Save changes
            </Button>
            <Typography variant="body2" color="text.secondary">
              Use Edit on a section to unlock its fields.
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}
