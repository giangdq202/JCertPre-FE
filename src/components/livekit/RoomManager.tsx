import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Box,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
  ContentCopy as CopyIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material';
import { livekitApi, type Room, type CreateRoomRequest } from '../../services/livekitService';

const RoomManager: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  // Form states for creating new room
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [maxParticipants, setMaxParticipants] = useState<number>(100);
  const [emptyTimeout, setEmptyTimeout] = useState<number>(5);
  const [metadata, setMetadata] = useState<string>('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const roomsList = await livekitApi.getRooms();
      setRooms(roomsList);
    } catch (err) {
      setError(`Failed to fetch rooms: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      setError('Room name is required');
      return;
    }

    try {
      const request: RoomCreateRequest = {
        roomName: newRoomName,
        maxParticipants,
        emptyTimeoutMinutes: emptyTimeout,
        metadata,
      };

      await livekitApi.createRoom(request);
      
      // Reset form
      setNewRoomName('');
      setMaxParticipants(100);
      setEmptyTimeout(5);
      setMetadata('');
      setCreateDialogOpen(false);
      
      // Refresh rooms list
      await fetchRooms();
    } catch (err) {
      setError(`Failed to create room: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const copyJoinLink = (roomName: string) => {
    const joinUrl = `${window.location.origin}/livekit/join/${encodeURIComponent(roomName)}`;
    navigator.clipboard.writeText(joinUrl);
    // Could show success message
  };

  const joinRoom = (roomName: string) => {
    navigate(`/livekit/join/${encodeURIComponent(roomName)}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            LiveKit Room Manager
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Room
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.name}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {room.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PeopleIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2">
                      {room.numParticipants} participants
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimeIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2">
                      Created: {new Date(room.creationTime).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {room.metadata && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {room.metadata}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VideoCallIcon />}
                      onClick={() => joinRoom(room.name)}
                    >
                      Join
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CopyIcon />}
                      onClick={() => copyJoinLink(room.name)}
                    >
                      Copy Link
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {rooms.length === 0 && !loading && (
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" color="textSecondary">
                No rooms available
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Create a new room to get started
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Create Room Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Room</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Room Name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Max Participants"
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            margin="normal"
            inputProps={{ min: 1, max: 1000 }}
          />
          
          <TextField
            fullWidth
            label="Empty Timeout (minutes)"
            type="number"
            value={emptyTimeout}
            onChange={(e) => setEmptyTimeout(Number(e.target.value))}
            margin="normal"
            inputProps={{ min: 1, max: 60 }}
          />
          
          <TextField
            fullWidth
            label="Metadata (optional)"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRoom} variant="contained">
            Create Room
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoomManager; 