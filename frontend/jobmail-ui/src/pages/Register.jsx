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
import {
  faAt,
  faEnvelope,
  faKey,
  faLock,
  faShieldHalved,
  faUser,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  gmailAddress: '',
  gmailAppPassword: '',
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(initialForm)

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (Object.values(form).some((value) => !value)) {
      setError('Please fill in all fields.')
      return
    }

    setError('')
    setLoading(true)
    try {
      await register({ ...form })
      navigate('/profile')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Try again.')
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
              Set up your JobMail workspace.
            </Typography>
            <Typography color="text.secondary">
              We encrypt your Gmail app password and never show it again. You stay in control.
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip
                icon={<FontAwesomeIcon icon={faShieldHalved} />}
                label="AES-256 encrypted"
                variant="outlined"
              />
              <Chip
                icon={<FontAwesomeIcon icon={faLock} />}
                label="No secrets stored in UI"
                variant="outlined"
              />
              <Chip
                icon={<FontAwesomeIcon icon={faEnvelope} />}
                label="Instant email preview"
                variant="outlined"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Already have an account? Sign in instead.
            </Typography>
          </Stack>
        </Paper>
      </Grid>
      <Grid item xs={12} md={5}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
          <Stack spacing={1.5}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Create your account
            </Typography>
            <Typography color="text.secondary">
              Add the Gmail identity you will send from.
            </Typography>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Stack spacing={2}>
                <TextField
                  label="Full name"
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                  placeholder="Your full name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faUser} />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  required
                />
                <TextField
                  label="Login email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="you@email.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faAt} />
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
                  placeholder="Create a password"
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
                <TextField
                  label="Gmail address"
                  type="email"
                  value={form.gmailAddress}
                  onChange={handleChange('gmailAddress')}
                  placeholder="you@gmail.com"
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
                  label="Gmail app password"
                  type="password"
                  value={form.gmailAppPassword}
                  onChange={handleChange('gmailAppPassword')}
                  placeholder="16-character app password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faKey} />
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
                    startIcon={<FontAwesomeIcon icon={faUserPlus} />}
                    sx={{ textTransform: 'none' }}
                  >
                    Create account
                  </Button>
                  <Link component={RouterLink} to="/login" underline="hover">
                    Already registered? Log in
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
