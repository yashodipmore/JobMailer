import { Box, Container, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        background: 'linear-gradient(90deg, #0f2f6b 0%, #0a1f3f 100%)',
        py: 2,
        mt: 4,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" sx={{ color: '#ffffff' }}>
          JobMailer · 2026 · Made by Yashodip More
        </Typography>
      </Container>
    </Box>
  )
}
