import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import { API_BASE_URL } from '../config';


const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          background: `linear-gradient(145deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
          color: 'white'
        }}
      >
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          Online Healthcare System
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 6 }}>
          Choose your role to continue
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {/* Doctor Section */}
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => navigate('/doctor-login')}
            >
              <LocalHospitalIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                I am a Doctor
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Access your medical dashboard and manage patient appointments
              </Typography>
              <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/doctor-login');
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/doctor-register');
                  }}
                >
                  Register
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Patient Section */}
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => navigate('/patient-login')}
            >
              <PersonIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                I am a Patient
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Book appointments and manage your healthcare needs
              </Typography>
              <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/patient-login');
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/patient-register');
                  }}
                >
                  Register
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default LandingPage; 