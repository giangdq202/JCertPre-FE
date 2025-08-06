import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VideoCall as VideoCallIcon,
  Schedule as ScheduleIcon,
  LiveTv as LiveTvIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { livestreamApi, type LivestreamDto, type CreateLivestreamDto, type UpdateLivestreamDto, LivestreamStatus } from '../../services/livestreamService';

const LivestreamManager: React.FC = () => {
  const [livestreams, setLivestreams] = useState<LivestreamDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedLivestream, setSelectedLivestream] = useState<LivestreamDto | null>(null);

  // Form states for creating/editing livestream
  const [formData, setFormData] = useState<CreateLivestreamDto>({
    courseId: '',
    description: '',
    scheduledDateTime: new Date().toISOString(),
    durationMinutes: 60,
  });

  useEffect(() => {
    fetchLivestreams();
  }, []);

  const fetchLivestreams = async () => {
    setLoading(true);
    setError('');
    try {
      const livestreamsList = await livestreamApi.getLivestreams();
      // Filter to ensure only LivestreamDto objects are set
      const filteredList = Array.isArray(livestreamsList) 
        ? livestreamsList.filter(item => 'isScheduled' in item) as LivestreamDto[]
        : [];
      setLivestreams(filteredList);
    } catch (err) {
      setError(`Failed to fetch livestreams: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLivestream = async () => {
    if (!formData.courseId.trim()) {
      setError('Course ID is required');
      return;
    }

    try {
      await livestreamApi.createLivestream(formData);
      
      // Reset form
      setFormData({
        courseId: '',
        description: '',
        scheduledDateTime: new Date().toISOString(),
        durationMinutes: 60,
      });
      setCreateDialogOpen(false);
      
      // Refresh livestreams list
      await fetchLivestreams();
    } catch (err) {
      setError(`Failed to create livestream: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEditLivestream = async () => {
    if (!selectedLivestream) return;

    try {
      const updateData: UpdateLivestreamDto = {
        description: formData.description,
        scheduledDateTime: formData.scheduledDateTime,
        durationMinutes: formData.durationMinutes,
      };

      await livestreamApi.updateLivestream(selectedLivestream.livestreamId, updateData);
      
      setEditDialogOpen(false);
      setSelectedLivestream(null);
      
      // Refresh livestreams list
      await fetchLivestreams();
    } catch (err) {
      setError(`Failed to update livestream: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteLivestream = async (livestreamId: string) => {
    if (!window.confirm('Are you sure you want to delete this livestream?')) return;

    try {
      await livestreamApi.deleteLivestream(livestreamId);
      await fetchLivestreams();
    } catch (err) {
      setError(`Failed to delete livestream: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEditClick = (livestream: LivestreamDto) => {
    setSelectedLivestream(livestream);
    setFormData({
      courseId: livestream.courseId,
      description: livestream.description || '',
      scheduledDateTime: livestream.scheduledDateTime,
      durationMinutes: livestream.durationMinutes,
    });
    setEditDialogOpen(true);
  };

  const getStatusColor = (status: LivestreamStatus) => {
    switch (status) {
      case LivestreamStatus.SCHEDULED:
        return 'warning';
      case LivestreamStatus.LIVE:
        return 'success';
      case LivestreamStatus.COMPLETED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: LivestreamStatus) => {
    switch (status) {
      case LivestreamStatus.SCHEDULED:
        return <ScheduleIcon />;
      case LivestreamStatus.LIVE:
        return <LiveTvIcon />;
      case LivestreamStatus.COMPLETED:
        return <CheckCircleIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Livestream Manager
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Livestream
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {livestreams.map((livestream) => (
            <Card key={livestream.livestreamId}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {livestream.courseName || `Course ${livestream.courseId}`}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(livestream.status)}
                    label={livestream.status}
                    color={getStatusColor(livestream.status) as any}
                    size="small"
                  />
                </Box>
                
                {livestream.description && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {livestream.description}
                  </Typography>
                )}
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Scheduled:</strong> {formatDateTime(livestream.scheduledDateTime)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Duration:</strong> {livestream.durationMinutes} minutes
                  </Typography>
                  <Typography variant="body2">
                    <strong>Ends:</strong> {formatDateTime(livestream.endDateTime)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {livestream.isLive && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VideoCallIcon />}
                      color="success"
                    >
                      Join Live
                    </Button>
                  )}
                  
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(livestream)}
                      disabled={livestream.isLive}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteLivestream(livestream.livestreamId)}
                      disabled={livestream.isLive}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {livestreams.length === 0 && !loading && (
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" color="textSecondary">
                No livestreams available
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Create a new livestream to get started
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Create Livestream Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Livestream</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Course ID"
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Scheduled Date & Time"
              value={new Date(formData.scheduledDateTime)}
              onChange={(newValue) => {
                if (newValue) {
                  setFormData({ ...formData, scheduledDateTime: newValue.toISOString() });
                }
              }}
              slots={{
                textField: (params) => <TextField {...params} fullWidth margin="normal" required />
              }}
            />
          </LocalizationProvider>
          
          <TextField
            fullWidth
            label="Duration (minutes)"
            type="number"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
            margin="normal"
            inputProps={{ min: 15, max: 480 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateLivestream} variant="contained">
            Create Livestream
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Livestream Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Livestream</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Scheduled Date & Time"
              value={new Date(formData.scheduledDateTime)}
              onChange={(newValue) => {
                if (newValue) {
                  setFormData({ ...formData, scheduledDateTime: newValue.toISOString() });
                }
              }}
              slots={{
                textField: (params) => <TextField {...params} fullWidth margin="normal" required />
              }}
            />
          </LocalizationProvider>
          
          <TextField
            fullWidth
            label="Duration (minutes)"
            type="number"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
            margin="normal"
            inputProps={{ min: 15, max: 480 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditLivestream} variant="contained">
            Update Livestream
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LivestreamManager; 