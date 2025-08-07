import React, { useState, useEffect, useCallback } from 'react';
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
  useRoomContext,
  useLocalParticipant,
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
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Fab,
  Drawer,
  useTheme,
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
  VolumeOff,
  Close as CloseIcon,
  Settings as SettingsIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import '@livekit/components-styles';
import { LIVEKIT_WS_URL } from '../../consts/apiUrl/baseUrl';
import { livestreamApi } from '../../services/livestreamService';

interface ChatMessage {
  id: string;
  message: string;
  sender: string;
  timestamp: string;
}

interface VideoConferenceRoomProps {
  roomName?: string;
  participantName?: string;
  token?: string;
  role?: string;
}

// Cute avatar component
const CuteAvatar: React.FC<{ name: string; isLocal: boolean; size?: number }> = ({ 
  name, 
  isLocal, 
  size = 40 
}) => {
  const cuteAvatars = [
    '🐱', '🐶', '🐰', '🐼', '🐨', '🐯', '🦁', '🐸', '🐙', '🐬',
    '🦄', '🦋', '🐞', '🐢', '🐍', '🦕', '🦖', '🐳', '🐋', '🐟',
    '🐠', '🐡', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🐘', '🦛',
    '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌',
    '🐕', '🐩', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🦨'
  ];
  
  const avatarIndex = name.charCodeAt(0) % cuteAvatars.length;
  const selectedAvatar = cuteAvatars[avatarIndex];
  
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.6,
        backgroundColor: isLocal ? '#667eea' : '#764ba2',
        border: isLocal ? '2px solid #fff' : '1px solid #e2e8f0',
        boxShadow: isLocal ? '0 4px 12px rgba(102, 126, 234, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          transform: 'scale(1.05)',
          transition: 'transform 0.2s ease-in-out'
        }
      }}
    >
      {selectedAvatar}
    </Avatar>
  );
};

// Custom Participant Tile Component
const CustomParticipantTile: React.FC<{ participant: any }> = ({ participant }) => {
  const tracks = useTracks();
  const participantTracks = tracks.filter(track => track.participant.identity === participant.identity);
  const videoTrack = participantTracks.find(track => track.source === Track.Source.Camera);
  const audioTrack = participantTracks.find(track => track.source === Track.Source.Microphone);
  
  const hasVideo = !!videoTrack;
  const hasAudio = !!audioTrack;

  return (
    <div className="relative w-full h-full bg-gray-800 rounded-lg overflow-hidden">
      {hasVideo ? (
        <div className="w-full h-full">
          <video
            ref={(el) => {
              if (el && videoTrack) {
                videoTrack.publication.track?.attach(el);
              }
            }}
            autoPlay
            muted={participant.isLocal}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
          <CuteAvatar 
            name={participant.identity} 
            isLocal={participant.isLocal}
            size={80}
          />
          <div className="mt-4 text-center">
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'white', 
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              {participant.identity}
            </Typography>
            <div className="flex items-center justify-center gap-2 mt-2">
              {hasAudio && (
                <MicIcon sx={{ color: 'white', fontSize: 16 }} />
              )}
              {!hasAudio && (
                <MicOffIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VideoConferenceRoom: React.FC<VideoConferenceRoomProps> = ({
  roomName: propRoomName,
  participantName: propParticipantName,
  token: propToken,
  role: propRole,
}) => {
  const { roomName: paramRoomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState<boolean>(false);
  const [showParticipants, setShowParticipants] = useState<boolean>(false);

  // Get room config from props or sessionStorage
  const getRoomConfig = () => {
    if (propRoomName && propParticipantName && propToken) {
      return {
        roomName: propRoomName,
        participantName: propParticipantName,
        token: propToken,
        role: propRole || 'Student',
      };
    }

    // Check for livestream config first
    const livestreamStored = sessionStorage.getItem('livestreamConfig');
    if (livestreamStored) {
      const livestreamConfig = JSON.parse(livestreamStored);
      return {
        roomName: livestreamConfig.roomName,
        participantName: livestreamConfig.title || 'Student',
        token: livestreamConfig.token,
        role: 'Student',
        isLivestream: true,
        ...livestreamConfig
      };
    }

    // Check for regular room config
    const stored = sessionStorage.getItem('roomConfig');
    if (stored) {
      return JSON.parse(stored);
    }

    return null;
  };

  const roomConfig = getRoomConfig();
  const roomName = roomConfig?.roomName || paramRoomName;
  const participantName = roomConfig?.participantName;
  const token = roomConfig?.token;
  const role = roomConfig?.role || 'Student';

  // Redirect if no valid configuration
  useEffect(() => {
    if (!roomConfig || !roomName || !participantName || !token) {
      navigate('/');
    }
  }, [roomConfig, roomName, participantName, token, navigate]);

  if (!roomConfig || !roomName || !participantName || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Paper elevation={3} className="p-8 text-center">
          <Typography variant="h6" color="error" className="mb-4">
            Cấu hình phòng không hợp lệ. Đang chuyển hướng...
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        </Paper>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={LIVEKIT_WS_URL}
      connect={true}
      video={true}
      audio={true}
    >
      <MyVideoConference
        roomName={roomName}
        participantName={participantName}
        userRole={role}
        onToggleChat={() => setShowChat(!showChat)}
        onToggleParticipants={() => setShowParticipants(!showParticipants)}
        showChat={showChat}
        showParticipants={showParticipants}
      />
    </LiveKitRoom>
  );
};

interface MyVideoConferenceProps {
  roomName: string;
  participantName: string;
  userRole: string;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  showChat: boolean;
  showParticipants: boolean;
  livestreamId?: string;
}

const MyVideoConference: React.FC<MyVideoConferenceProps> = ({
  roomName,
  participantName,
  userRole,
  onToggleChat,
  onToggleParticipants,
  showChat,
  showParticipants,
  livestreamId,
}) => {
  const theme = useTheme();
  const [layout, setLayout] = useState<'grid' | 'focus' | 'carousel'>('grid');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const participants = useParticipants();
  const tracks = useTracks();
  const { localParticipant } = useLocalParticipant();

  const handleMuteParticipant = async (participantIdentity: string) => {
    if (!livestreamId) {
      console.error('Livestream ID not available for mute operation');
      return;
    }
    try {
      await livestreamApi.muteParticipant(livestreamId, participantIdentity, { mute: true });
    } catch (error) {
      console.error('Failed to mute participant:', error);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        message: newMessage,
        sender: participantName,
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const renderVideoLayout = () => {
    switch (layout) {
      case 'grid':
        return (
          <div className="w-full h-full p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-full">
              {participants.map((participant) => (
                <CustomParticipantTile key={participant.identity} participant={participant} />
              ))}
            </div>
          </div>
        );
      case 'focus':
        return <FocusLayout />;
      case 'carousel':
        return <CarouselLayout tracks={tracks}>
          <></>
        </CarouselLayout>;
      default:
        return (
          <div className="w-full h-full p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-full">
              {participants.map((participant) => (
                <CustomParticipantTile key={participant.identity} participant={participant} />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Modern Header */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <Typography variant="h6" component="div" sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              color: 'white'
            }}>
              {participantName}
            </Typography>
          </div>
          
          <div className="flex items-center gap-2">
            <ButtonGroup variant="outlined" size="small" sx={{ 
              backgroundColor: 'rgba(255,255,255,0.1)',
              '& .MuiButton-root': {
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.5)'
                }
              }
            }}>
              <Tooltip title="Grid Layout">
                <IconButton
                  onClick={() => setLayout('grid')}
                  sx={{ 
                    color: layout === 'grid' ? theme.palette.primary.main : 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <GridIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Focus Layout">
                <IconButton
                  onClick={() => setLayout('focus')}
                  sx={{ 
                    color: layout === 'focus' ? theme.palette.primary.main : 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <FocusIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Carousel Layout">
                <IconButton
                  onClick={() => setLayout('carousel')}
                  sx={{ 
                    color: layout === 'carousel' ? theme.palette.primary.main : 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <CarouselIcon />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />

            <Tooltip title="Participants">
              <IconButton onClick={onToggleParticipants} sx={{ color: 'white' }}>
                <Badge badgeContent={participants.length} color="secondary">
                  <PeopleIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Chat">
              <IconButton onClick={onToggleChat} sx={{ color: 'white' }}>
                <ChatIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </div>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Video Area */}
        <div className="flex-1 relative bg-black">
          <div className="absolute inset-0">
            {renderVideoLayout()}
          </div>
          <RoomAudioRenderer />
        </div>

        {/* Modern Sidebar */}
        {(showParticipants || showChat) && (
          <Drawer
            variant="persistent"
            anchor="right"
            open={showParticipants || showChat}
            sx={{
              width: 320,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 320,
                boxSizing: 'border-box',
                backgroundColor: '#f8fafc',
                borderLeft: '1px solid #e2e8f0'
              },
            }}
          >
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {showParticipants ? 'Participants' : 'Chat'}
                  </Typography>
                  <IconButton onClick={showParticipants ? onToggleParticipants : onToggleChat} size="small">
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-hidden">
                {showParticipants && (
                  <div className="h-full">
                    <List sx={{ p: 0 }}>
                      {participants.map((participant) => (
                        <ListItem key={participant.identity} sx={{ 
                          borderBottom: '1px solid #f1f5f9',
                          '&:hover': { backgroundColor: '#f8fafc' }
                        }}>
                          <ListItemAvatar>
                            <CuteAvatar 
                              name={participant.identity} 
                              isLocal={participant.isLocal}
                              size={40}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{participant.identity}</span>
                                {participant.isLocal && (
                                  <Chip label="You" size="small" color="primary" />
                                )}
                                <ConnectionQualityIndicator participant={participant} />
                              </div>
                            }
                            secondary={
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {participant.isMicrophoneEnabled && (
                                  <MicIcon fontSize="small" />
                                )}
                                {participant.isCameraEnabled && (
                                  <VideocamIcon fontSize="small" />
                                )}
                              </div>
                            }
                          />
                          {userRole === 'Instructor' && !participant.isLocal && (
                            <ListItemSecondaryAction>
                              <Tooltip title="Mute">
                                <IconButton
                                  size="small"
                                  onClick={() => handleMuteParticipant(participant.identity)}
                                  sx={{ color: theme.palette.warning.main }}
                                >
                                  <MicOffIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </div>
                )}

                {showChat && (
                  <div className="h-full flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((message, index) => (
                        <Paper key={index} elevation={1} sx={{ 
                          p: 2, 
                          backgroundColor: message.sender === participantName ? theme.palette.primary.light : '#f8fafc',
                          color: message.sender === participantName ? 'white' : 'inherit'
                        }}>
                          <div className="flex items-start gap-2">
                            <CuteAvatar 
                              name={message.sender} 
                              isLocal={message.sender === participantName}
                              size={24}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {message.sender}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </Typography>
                              </div>
                              <Typography variant="body2">{message.message}</Typography>
                            </div>
                          </div>
                        </Paper>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <div className="flex gap-2">
                        <TextField
                          fullWidth
                          size="small"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          sx={{ 
                            minWidth: 'auto',
                            px: 2,
                            borderRadius: 2
                          }}
                        >
                          <Send />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Drawer>
        )}
      </div>

      {/* Modern Control Bar */}
      <div className="bg-white border-t border-gray-200 p-4">
        <ControlBar 
          variation="minimal"
          controls={{
            camera: true,
            microphone: true,
            screenShare: true,
            chat: false,
            leave: true,
          }}
        />
      </div>
    </div>
  );
};

export default VideoConferenceRoom; 