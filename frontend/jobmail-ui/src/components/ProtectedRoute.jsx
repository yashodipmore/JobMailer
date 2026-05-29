import { Box, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={20} />
            <Typography>Loading your workspace...</Typography>
          </Stack>
        </Paper>
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
