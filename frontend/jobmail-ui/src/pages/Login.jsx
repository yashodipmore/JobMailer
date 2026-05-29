import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faEnvelope, faLock, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }

    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/chat')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Grid container spacing={3} alignItems="stretch">
      <Grid item xs={12} md={7}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Write job emails that sound like you.
            </Typography>
            <Typography color="text.secondary">
              Paste a LinkedIn post, let the AI shape your story, then send from Gmail in minutes.
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip
                icon={<FontAwesomeIcon icon={faWandMagicSparkles} />}
                label="Profile-aware drafting"
                variant="outlined"
              />
              <Chip
                icon={<FontAwesomeIcon icon={faBolt} />}
                label="Gmail-ready delivery"
                variant="outlined"
              />
              <Chip
                icon={<FontAwesomeIcon icon={faWandMagicSparkles} />}
                label="Clean, short, professional"
                variant="outlined"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              New here? Create your workspace in under two minutes.
            </Typography>
          </Stack>
        </Paper>
      </Grid>
      <Grid item xs={12} md={5}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
          <Stack spacing={1.5}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Welcome back
            </Typography>
            <Typography color="text.secondary">
              Sign in to continue building your application emails.
            </Typography>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="you@email.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Your password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faLock} />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  required
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={<FontAwesomeIcon icon={faBolt} />}
                    sx={{ textTransform: 'none' }}
                  >
                    Sign in
                  </Button>
                  <Link component={RouterLink} to="/register" underline="hover">
                    Need an account? Register
                  </Link>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}
