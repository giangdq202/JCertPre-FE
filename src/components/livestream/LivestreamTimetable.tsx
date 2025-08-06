import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  Grid,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Schedule as ScheduleIcon,
  LiveTv as LiveTvIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { livestreamApi, type LivestreamTimetableDto, LivestreamStatus, UserRoleInCourse } from '../../services/livestreamService';

interface LivestreamTimetableProps {
  userId: string;
}

const LivestreamTimetable: React.FC<LivestreamTimetableProps> = ({ userId }) => {
  const [timetable, setTimetable] = useState<LivestreamTimetableDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchTimetable();
  }, [userId]);

  const fetchTimetable = async () => {
    setLoading(true);
    setError('');
    try {
      const timetableData = await livestreamApi.getLivestreamTimetableByUser(userId);
      setTimetable(timetableData);
    } catch (err) {
      setError(`Failed to fetch timetable: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLivestream = async (livestreamId: string) => {
    try {
      const joinData = await livestreamApi.generateJoinToken(livestreamId, userId);
      // Store join data in sessionStorage for the video conference component
      sessionStorage.setItem('livestreamConfig', JSON.stringify({
        ...joinData,
        livestreamId,
        userId,
      }));
      
      // Navigate to the livestream room
      window.location.href = `/livestream/room/${livestreamId}`;
    } catch (err) {
      setError(`Failed to join livestream: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
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

  const getUserRoleIcon = (role: UserRoleInCourse) => {
    switch (role) {
      case UserRoleInCourse.INSTRUCTOR:
        return <SchoolIcon />;
      case UserRoleInCourse.STUDENT:
        return <PersonIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getUserRoleColor = (role: UserRoleInCourse) => {
    switch (role) {
      case UserRoleInCourse.INSTRUCTOR:
        return 'primary';
      case UserRoleInCourse.STUDENT:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleDateString();
  };

  const getTimeStatusColor = (timeStatus: string) => {
    if (timeStatus.includes('Live')) return 'success';
    if (timeStatus.includes('Starting soon')) return 'warning';
    if (timeStatus.includes('Starts in')) return 'info';
    if (timeStatus.includes('Completed')) return 'default';
    return 'default';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          My Livestream Timetable
        </Typography>
        
        <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 4 }}>
          View and join your scheduled livestreams
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Typography>Loading timetable...</Typography>
          </Box>
        ) : (
          <>
            {/* Grid View */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
              {timetable.map((item) => (
                <Card 
                  sx={{ 
                    height: '100%',
                    border: item.isLive ? '2px solid #4caf50' : '1px solid #e0e0e0',
                    backgroundColor: item.isLive ? '#f8fff8' : 'inherit'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {item.courseName}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(item.status)}
                        label={item.status}
                        color={getStatusColor(item.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    {item.description && (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {item.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Date:</strong> {formatDate(item.scheduledDateTime)}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Time:</strong> {formatTime(item.scheduledDateTime)} - {formatTime(item.endDateTime)}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Duration:</strong> {item.durationMinutes} minutes
                      </Typography>
                      <Chip
                        icon={getUserRoleIcon(item.userRole)}
                        label={item.userRole}
                        color={getUserRoleColor(item.userRole) as any}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        icon={<AccessTimeIcon />}
                        label={item.timeStatus}
                        color={getTimeStatusColor(item.timeStatus) as any}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {item.canJoin && item.isLive && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VideoCallIcon />}
                          color="success"
                          onClick={() => handleJoinLivestream(item.livestreamId)}
                          fullWidth
                        >
                          Join Live
                        </Button>
                      )}
                      
                      {!item.canJoin && item.isLive && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          disabled
                          fullWidth
                        >
                          No Permission
                        </Button>
                      )}
                      
                      {item.status === LivestreamStatus.SCHEDULED && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="info"
                          disabled
                          fullWidth
                        >
                          {item.startsWithin15Minutes ? 'Starting Soon' : 'Scheduled'}
                        </Button>
                      )}
                      
                      {item.status === LivestreamStatus.COMPLETED && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="inherit"
                          disabled
                          fullWidth
                        >
                          Completed
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Table View */}
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Course</strong></TableCell>
                      <TableCell><strong>Date & Time</strong></TableCell>
                      <TableCell><strong>Duration</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Role</strong></TableCell>
                      <TableCell><strong>Time Status</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {timetable.map((item) => (
                      <TableRow 
                        key={item.livestreamId}
                        sx={{ 
                          backgroundColor: item.isLive ? '#f8fff8' : 'inherit',
                          '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                      >
                        <TableCell>
                          <Typography variant="subtitle2">
                            {item.courseName}
                          </Typography>
                          {item.description && (
                            <Typography variant="caption" color="textSecondary">
                              {item.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(item.scheduledDateTime)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatTime(item.scheduledDateTime)} - {formatTime(item.endDateTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.durationMinutes} min
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(item.status)}
                            label={item.status}
                            color={getStatusColor(item.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getUserRoleIcon(item.userRole)}
                            label={item.userRole}
                            color={getUserRoleColor(item.userRole) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<AccessTimeIcon />}
                            label={item.timeStatus}
                            color={getTimeStatusColor(item.timeStatus) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {item.canJoin && item.isLive && (
                            <Tooltip title="Join Live">
                              <IconButton
                                color="success"
                                onClick={() => handleJoinLivestream(item.livestreamId)}
                              >
                                <VideoCallIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {timetable.length === 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" align="center" color="textSecondary">
                    No livestreams scheduled
                  </Typography>
                  <Typography variant="body2" align="center" color="textSecondary">
                    You don't have any livestreams in your timetable yet
                  </Typography>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default LivestreamTimetable; 