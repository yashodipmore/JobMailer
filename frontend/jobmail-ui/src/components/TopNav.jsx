import { AppBar, Box, Button, Chip, Stack, Toolbar, Typography } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRightFromBracket,
  faClock,
  faComments,
  faEnvelopeOpenText,
  faHandSparkles,
  faRightToBracket,
  faUser,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function TopNav() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const navButtonProps = (path) => ({
    component: RouterLink,
    to: path,
    size: 'small',
    variant: isActive(path) ? 'contained' : 'text',
    color: isActive(path) ? 'primary' : 'inherit',
    sx: { textTransform: 'none', borderRadius: 999, px: 2 },
  })

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'common.white' }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1 }}>
        <Stack
          component={RouterLink}
          to="/"
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0d2a63 0%, #1e5bd8 100%)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <FontAwesomeIcon icon={faEnvelopeOpenText} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Poppins, Inter, sans-serif',
              fontWeight: 600,
              color: '#0d2a63',
            }}
          >
            JobMailer
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {user ? (
            <>
              <Button
                {...navButtonProps('/chat')}
                startIcon={<FontAwesomeIcon icon={faComments} />}
              >
                Chat
              </Button>
              <Button
                {...navButtonProps('/history')}
                startIcon={<FontAwesomeIcon icon={faClock} />}
              >
                History
              </Button>
              <Button
                {...navButtonProps('/profile')}
                startIcon={<FontAwesomeIcon icon={faUser} />}
              >
                Profile
              </Button>
              <Chip
                size="small"
                variant="outlined"
                icon={<FontAwesomeIcon icon={faHandSparkles} style={{ fontSize: 12 }} />}
                label={`Hi ${user.fullName ? user.fullName.split(' ')[0] : 'there'}`}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={logout}
                startIcon={<FontAwesomeIcon icon={faArrowRightFromBracket} />}
                sx={{ textTransform: 'none', borderRadius: 999 }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button
                {...navButtonProps('/login')}
                startIcon={<FontAwesomeIcon icon={faRightToBracket} />}
              >
                Login
              </Button>
              <Button
                {...navButtonProps('/register')}
                startIcon={<FontAwesomeIcon icon={faUserPlus} />}
              >
                Register
              </Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
