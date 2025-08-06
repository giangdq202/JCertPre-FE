import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { livekitApi } from '../../services/livekitService';

interface PreJoinProps {
  roomName?: string;
  onJoin?: (config: {
    roomName: string;
    participantName: string;
    token: string;
    role: string;
  }) => void;
}

const PreJoin: React.FC<PreJoinProps> = ({ roomName: propRoomName, onJoin }) => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState(propRoomName || '');
  const [participantName, setParticipantName] = useState('');
  const [role, setRole] = useState<'Student' | 'Instructor' | 'Admin'>('Student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!roomName.trim() || !participantName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await livekitApi.getToken({
        roomName: roomName.trim(),
        participantName: participantName.trim(),
        role,
      });

      const config = {
        roomName: roomName.trim(),
        participantName: participantName.trim(),
        token,
        role,
      };

      // Store config in sessionStorage for the video conference component
      sessionStorage.setItem('roomConfig', JSON.stringify(config));

      if (onJoin) {
        onJoin(config);
      } else {
        // Navigate to the video conference page
        navigate(`/livekit/room/${encodeURIComponent(roomName.trim())}`);
      }
    } catch (err) {
      setError(`Failed to join room: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Join Video Conference
        </Typography>
        
        <Card>
          <CardContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                margin="normal"
                required
                disabled={!!propRoomName}
              />
              
              <TextField
                fullWidth
                label="Your Name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                margin="normal"
                required
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value as 'Student' | 'Instructor' | 'Admin')}
                >
                  <MenuItem value="Student">Student</MenuItem>
                  <MenuItem value="Instructor">Instructor</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={handleJoin}
                disabled={loading || !roomName.trim() || !participantName.trim()}
                sx={{ mt: 3 }}
              >
                {loading ? 'Joining...' : 'Join Room'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default PreJoin; 