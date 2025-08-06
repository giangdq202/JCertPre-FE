import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ConnectionQualityIndicator,
  useDataChannel,
  useParticipants,
  ConnectionState,
  ControlBar,
  ParticipantName,
  FocusLayout,
  CarouselLayout,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import {
  AppBar,
  Toolbar,
  Typography,
  Badge,
  IconButton,
  Tooltip,
  Paper,
  Chip,
  ButtonGroup,
  Button,
  Box,
  Alert,
} from '@mui/material';
import {
  Chat as ChatIcon,
  People as PeopleIcon,
  Videocam as VideocamIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VideocamOff as VideocamOffIcon,
  ViewModule as GridIcon,
  CenterFocusStrong as FocusIcon,
  ViewCarousel as CarouselIcon,
  Send,
  RemoveCircle,
  VolumeOff,
  LiveTv as LiveTvIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import '@livekit/components-styles';
import { livestreamApi, type LivestreamDto, type LivestreamJoinDto, LivestreamStatus } from '../../services/livestreamService';

interface LivestreamRoomProps {
  livestreamId?: string;
  userId?: string;
}

const LivestreamRoom: React.FC<LivestreamRoomProps> = ({
  livestreamId: propLivestreamId,
  userId: propUserId,
}) => {
  const { livestreamId: paramLivestreamId } = useParams<{ livestreamId: string }>();
  const navigate = useNavigate();
  
  const [showChat, setShowChat] = useState<boolean>(false);
  const [showParticipants, setShowParticipants] = useState<boolean>(false);
  const [livestream, setLivestream] = useState<LivestreamDto | null>(null);
  const [joinData, setJoinData] = useState<LivestreamJoinDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const livestreamId = propLivestreamId || paramLivestreamId;
  const userId = propUserId || 'current-user-id'; // This should come from auth context

  // Get livestream config from props or sessionStorage
  const getLivestreamConfig = () => {
    const stored = sessionStorage.getItem('livestreamConfig');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  };

  const livestreamConfig = getLivestreamConfig();

  useEffect(() => {
    if (livestreamConfig) {
      setJoinData(livestreamConfig);
      setLoading(false);
    } else if (livestreamId) {
      fetchLivestreamData();
    } else {
      setError('No livestream configuration found');
      setLoading(false);
    }
  }, [livestreamId]);

  const fetchLivestreamData = async () => {
    if (!livestreamId) return;

    setLoading(true);
    setError('');
    try {
      // Fetch livestream details
      const livestreamData = await livestreamApi.getLivestreamById(livestreamId);
      setLivestream(livestreamData);

      // Generate join token
      const joinTokenData = await livestreamApi.generateJoinToken(livestreamId, userId);
      setJoinData(joinTokenData);

      // Store in sessionStorage
      sessionStorage.setItem('livestreamConfig', JSON.stringify({
        ...joinTokenData,
        livestreamId,
        userId,
      }));
    } catch (err) {
      setError(`Failed to join livestream: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if no valid configuration
  useEffect(() => {
    if (!loading && (!livestreamConfig || !joinData)) {
      navigate('/livestreams');
    }
  }, [loading, livestreamConfig, joinData, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading livestream...</Typography>
      </Box>
    );
  }

  if (error || !joinData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">
          {error || 'Failed to load livestream'}
        </Alert>
      </Box>
    );
  }

  return (
    <LiveKitRoom
      token={joinData.token}
      serverUrl={(import.meta as any).env?.VITE_LIVEKIT_URL || 'wss://your-livekit-server.com'}
      connect={true}
      video={true}
      audio={true}
    >
      <MyLivestreamRoom
        livestream={livestream}
        joinData={joinData}
        onToggleChat={() => setShowChat(!showChat)}
        onToggleParticipants={() => setShowParticipants(!showParticipants)}
        showChat={showChat}
        showParticipants={showParticipants}
      />
    </LiveKitRoom>
  );
};

interface MyLivestreamRoomProps {
  livestream: LivestreamDto | null;
  joinData: LivestreamJoinDto;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  showChat: boolean;
  showParticipants: boolean;
}

const MyLivestreamRoom: React.FC<MyLivestreamRoomProps> = ({
  livestream,
  joinData,
  onToggleChat,
  onToggleParticipants,
  showChat,
  showParticipants,
}) => {
  const [layout, setLayout] = useState<'grid' | 'focus' | 'carousel'>('grid');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const participants = useParticipants();
  const tracks = useTracks();

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        message: newMessage,
        sender: 'You',
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const renderVideoLayout = () => {
    switch (layout) {
      case 'grid':
        return (
          <GridLayout tracks={tracks}>
            {tracks.map((track) => (
              <ParticipantTile key={track.participant.identity} />
            ))}
          </GridLayout>
        );
      case 'focus':
        return (
          <FocusLayout>
            {tracks.map((track) => (
              <ParticipantTile key={track.participant.identity} />
            ))}
          </FocusLayout>
        );
      case 'carousel':
        return (
          <CarouselLayout tracks={tracks}>
            {tracks.map((track) => (
              <ParticipantTile key={track.participant.identity} />
            ))}
          </CarouselLayout>
        );
      default:
        return (
          <GridLayout tracks={tracks}>
            {tracks.map((track) => (
              <ParticipantTile key={track.participant.identity} />
            ))}
          </GridLayout>
        );
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

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ mr: 2 }}>
              {joinData.title}
            </Typography>
            {livestream && (
              <Chip
                icon={getStatusIcon(livestream.status)}
                label={livestream.status}
                color={livestream.status === LivestreamStatus.LIVE ? 'success' : 'default'}
                size="small"
              />
            )}
          </Box>
          
          <ButtonGroup variant="outlined" size="small">
            <Tooltip title="Grid Layout">
              <IconButton
                onClick={() => setLayout('grid')}
                color={layout === 'grid' ? 'primary' : 'inherit'}
              >
                <GridIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Focus Layout">
              <IconButton
                onClick={() => setLayout('focus')}
                color={layout === 'focus' ? 'primary' : 'inherit'}
              >
                <FocusIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Carousel Layout">
              <IconButton
                onClick={() => setLayout('carousel')}
                color={layout === 'carousel' ? 'primary' : 'inherit'}
              >
                <CarouselIcon />
              </IconButton>
            </Tooltip>
          </ButtonGroup>

          <Tooltip title="Participants">
            <IconButton onClick={onToggleParticipants} color="inherit">
              <Badge badgeContent={participants.length} color="secondary">
                <PeopleIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Chat">
            <IconButton onClick={onToggleChat} color="inherit">
              <ChatIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {renderVideoLayout()}
          <RoomAudioRenderer />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-100 border-l">
          {showParticipants && (
            <div className="p-4">
              <Typography variant="h6" gutterBottom>
                Participants ({participants.length})
              </Typography>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <Paper key={participant.identity} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ParticipantName participant={participant} />
                        <ConnectionQualityIndicator participant={participant} />
                        {participant.isLocal && (
                          <Chip label="You" size="small" color="primary" />
                        )}
                      </div>
                    </div>
                  </Paper>
                ))}
              </div>
            </div>
          )}

          {showChat && (
            <div className="p-4 h-full flex flex-col">
              <Typography variant="h6" gutterBottom>
                Chat
              </Typography>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {messages.map((message, index) => (
                  <Paper key={index} className="p-2">
                    <Typography variant="caption" color="textSecondary">
                      {message.sender} - {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                    <Typography variant="body2">{message.message}</Typography>
                  </Paper>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <ControlBar />
    </div>
  );
};

export default LivestreamRoom; 