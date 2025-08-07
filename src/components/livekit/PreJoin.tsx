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
} from '@mui/material';
import { livestreamApi } from '../../services/livestreamService';

interface PreJoinProps {
  livestreamId?: string;
  userId?: string;
  onJoin?: (config: {
    roomName: string;
    participantName: string;
    token: string;
    title: string;
    scheduledDateTime: string;
    description?: string;
    durationMinutes: number;
  }) => void;
}

const PreJoin: React.FC<PreJoinProps> = ({ livestreamId, userId, onJoin }) => {
  const navigate = useNavigate();
  const [inputLivestreamId, setInputLivestreamId] = useState(livestreamId || '');
  const [inputUserId, setInputUserId] = useState(userId || '');
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!inputLivestreamId.trim() || !inputUserId.trim() || !participantName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tokenResponse = await livestreamApi.getJoinToken(
        inputLivestreamId.trim(),
        inputUserId.trim()
      );

      const config = {
        roomName: tokenResponse.roomName,
        participantName: participantName.trim(),
        token: tokenResponse.token,
        title: tokenResponse.title,
        scheduledDateTime: tokenResponse.scheduledDateTime,
        description: tokenResponse.description,
        durationMinutes: tokenResponse.durationMinutes,
      };

      // Store config in sessionStorage for the video conference component
      sessionStorage.setItem('roomConfig', JSON.stringify(config));

      if (onJoin) {
        onJoin(config);
      } else {
        // Navigate to the video conference page
        navigate(`/livekit/room/${encodeURIComponent(tokenResponse.roomName)}`);
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
                label="Livestream ID"
                value={inputLivestreamId}
                onChange={(e) => setInputLivestreamId(e.target.value)}
                margin="normal"
                required
                disabled={!!livestreamId}
              />
              
              <TextField
                fullWidth
                label="User ID"
                value={inputUserId}
                onChange={(e) => setInputUserId(e.target.value)}
                margin="normal"
                required
                disabled={!!userId}
              />
              
              <TextField
                fullWidth
                label="Your Name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                margin="normal"
                required
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={handleJoin}
                disabled={loading || !inputLivestreamId.trim() || !inputUserId.trim() || !participantName.trim()}
                sx={{ mt: 3 }}
              >
                {loading ? 'Joining...' : 'Join Livestream'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default PreJoin; 