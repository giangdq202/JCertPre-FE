import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  AccessTime as TimeIcon,
  ContentCopy as CopyIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material';
import { livestreamApi, type LivestreamDto } from '../../services/livestreamService';

const RoomManager: React.FC = () => {
  const [livestreams, setLivestreams] = useState<(LivestreamDto | any)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLivestreams();
  }, []);

  const fetchLivestreams = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await livestreamApi.getLivestreams();
      // Handle different response formats
      if (Array.isArray(response)) {
        setLivestreams(response);
      } else if (response && 'data' in response) {
        setLivestreams(response.data as any[]);
      } else {
        setLivestreams([]);
      }
    } catch (err) {
      setError(`Failed to fetch livestreams: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const joinLivestream = (livestreamId: string) => {
    navigate(`/livekit/join/${encodeURIComponent(livestreamId)}`);
  };

  const copyJoinLink = (livestreamId: string) => {
    const joinUrl = `${window.location.origin}/livekit/join/${encodeURIComponent(livestreamId)}`;
    navigator.clipboard.writeText(joinUrl);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Available Livestreams
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLivestreams}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {livestreams.map((livestream) => (
            <Card key={livestream.livestreamId}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {livestream.courseName || `Course ${livestream.courseId}`}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimeIcon sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">
                    {new Date(livestream.scheduledDateTime).toLocaleString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2">
                    Duration: {livestream.durationMinutes} minutes
                  </Typography>
                </Box>

                {livestream.description && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {livestream.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VideoCallIcon />}
                    onClick={() => joinLivestream(livestream.livestreamId)}
                  >
                    Join
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => copyJoinLink(livestream.livestreamId)}
                  >
                    Copy Link
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </div>

        {livestreams.length === 0 && !loading && (
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" color="textSecondary">
                No livestreams available
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Check back later for scheduled livestreams
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default RoomManager; 