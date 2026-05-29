import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import api from '../services/api.js'

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

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
  }

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/history')
        setItems(data || [])
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load history.')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const handleDownloadCsv = async () => {
    setDownloading(true)
    setError('')
    try {
      const response = await api.get('/api/history/csv', { responseType: 'blob' })
      const fileUrl = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = 'email-history.csv'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(fileUrl), 10000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to download CSV.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={mainHeadingSx}>
          Email history
        </Typography>
        <Typography color="text.secondary">
          Track every email you have sent from JobMailer.
        </Typography>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Paper variant="outlined" sx={sectionPaperSx}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Sent emails
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total sent: {items.length}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={faDownload} />}
              onClick={handleDownloadCsv}
              disabled={downloading || items.length === 0}
              sx={{ textTransform: 'none' }}
            >
              Download CSV
            </Button>
          </Stack>

          {loading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={20} />
              <Typography>Loading history...</Typography>
            </Stack>
          ) : null}

          {!loading && items.length === 0 ? (
            <Typography color="text.secondary">No emails sent yet.</Typography>
          ) : null}

          {!loading && items.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sent at</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Subject</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.sentAt ? new Date(item.sentAt).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>{item.toEmail || '-'}</TableCell>
                      <TableCell>{item.subject || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  )
}
