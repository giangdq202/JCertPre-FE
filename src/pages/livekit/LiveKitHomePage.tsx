import React from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent } from '@mui/material';
import { VideoCall as VideoCallIcon, Group as GroupIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LiveKitHomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Join Video Conference',
      description: 'Join an existing video conference room',
      icon: <VideoCallIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/livekit/join'),
      color: 'primary',
    },
    {
      title: 'Create Room',
      description: 'Create a new video conference room',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/livekit/create'),
      color: 'secondary',
    },
    {
      title: 'Room Management',
      description: 'Manage and monitor video conference rooms',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/livekit/manage'),
      color: 'success',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          LiveKit Video Conference
        </Typography>
        
        <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 6 }}>
          High-quality video conferencing powered by LiveKit
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {features.map((feature, index) => (
            <Card 
              key={index}
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
              onClick={feature.action}
            >
              <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                <Box sx={{ color: `${feature.color}.main`, mb: 2 }}>
                  {feature.icon}
                </Box>
                
                <Typography variant="h5" component="h2" gutterBottom>
                  {feature.title}
                </Typography>
                
                <Typography variant="body1" color="textSecondary">
                  {feature.description}
                </Typography>
                
                <Button
                  variant="contained"
                  color={feature.color as any}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default LiveKitHomePage; 