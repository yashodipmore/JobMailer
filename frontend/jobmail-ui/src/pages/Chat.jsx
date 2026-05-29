import {
  Alert,
  Box,
  Button,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faPaperPlane, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import api from '../services/api.js'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [needsProfile, setNeedsProfile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentMessage, setSentMessage] = useState('')

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
  const sectionPaperSx = {
    p: { xs: 2, md: 3 },
    border: 0,
    borderRadius: 0,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
    height: '100%',
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) {
      return
    }

    setError('')
    setNeedsProfile(false)
    setSentMessage('')
    setInput('')
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text }])
    setLoading(true)

    try {
      const { data } = await api.post('/api/chat/message', {
        message: text,
        sessionId: null,
      })
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: data.reply },
      ])
      setDraft(data.emailDraft || null)
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to reach the AI service.'
      setError(message)
      setNeedsProfile(message.toLowerCase().includes('profile'))
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!draft) {
      return
    }
    setSending(true)
    setError('')
    setSentMessage('')
    try {
      await api.post('/api/chat/send-email', {
        toEmail: draft.toEmail,
        subject: draft.subject,
        body: draft.body,
        includeCv: true,
      })
      setSentMessage('Email sent successfully.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send the email.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={mainHeadingSx}>
          Chat drafts
        </Typography>
        <Typography color="text.secondary">
          Paste a job post and let JobMail draft the application email.
        </Typography>
      </Box>
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={sectionPaperSx}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              {messages.length === 0 ? (
                <Typography color="text.secondary">
                  Start by pasting a job post or recruiter email.
                </Typography>
              ) : null}
              <Stack spacing={1.5} sx={{ flex: 1 }}>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                      bgcolor: message.role === 'user' ? 'primary.light' : 'grey.100',
                      color: 'text.primary',
                      px: 2,
                      py: 1.25,
                      borderRadius: 2,
                      maxWidth: '85%',
                    }}
                  >
                    <Typography variant="body2">{message.text}</Typography>
                  </Box>
                ))}
              </Stack>
              {needsProfile ? (
                <Alert
                  severity="warning"
                  action={
                    <Button
                      component={RouterLink}
                      to="/profile"
                      size="small"
                      sx={{ textTransform: 'none' }}
                    >
                      Go to profile
                    </Button>
                  }
                >
                  Complete your profile before drafting.
                </Alert>
              ) : null}
              {error ? <Alert severity="error">{error}</Alert> : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-end">
                <TextField
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={3}
                  multiline
                  placeholder="Paste the job description, company name, and recruiter email..."
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleSend}
                  disabled={loading}
                  startIcon={<FontAwesomeIcon icon={faWandMagicSparkles} />}
                  sx={{ textTransform: 'none' }}
                >
                  Draft
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={sectionPaperSx}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Email draft
              </Typography>
              {draft ? (
                <>
                  <TextField
                    value={draft.toEmail}
                    onChange={(event) => setDraft({ ...draft, toEmail: event.target.value })}
                    placeholder="Recipient email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FontAwesomeIcon icon={faEnvelope} />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                  <TextField
                    value={draft.subject}
                    onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
                    placeholder="Subject"
                    fullWidth
                  />
                  <TextField
                    rows={8}
                    multiline
                    value={draft.body}
                    onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                    placeholder="Email body"
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendEmail}
                    disabled={sending}
                    startIcon={<FontAwesomeIcon icon={faPaperPlane} />}
                    sx={{ textTransform: 'none' }}
                  >
                    Send now
                  </Button>
                  {sentMessage ? <Alert severity="success">{sentMessage}</Alert> : null}
                </>
              ) : (
                <Typography color="text.secondary">
                  Drafts will appear here once the AI generates them.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}
