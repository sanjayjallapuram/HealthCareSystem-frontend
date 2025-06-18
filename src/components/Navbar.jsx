import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  if (!isAuthenticated) {
    return null;
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/');
  };

  const handleDashboard = () => {
    handleClose();
    if (user?.roles?.includes('ROLE_DOCTOR')) {
      navigate('/doctor-dashboard');
    } else if (user?.roles?.includes('ROLE_PATIENT')) {
      navigate('/patient-dashboard');
    }
  };

  const handleViewProfile = () => {
    handleClose();
    if (user?.roles?.includes('ROLE_DOCTOR')) {
      navigate(`/doctor-profile/${user.username}`);
    } else if (user?.roles?.includes('ROLE_PATIENT')) {
      navigate(`/patient-profile/${user.username}`);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Healthcare System
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={`${user?.roles?.includes('ROLE_DOCTOR') ? 'Dr. ' : ''}${user?.username || ''}`}
            color="secondary"
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
            onClick={handleViewProfile}
          />
          <Button 
            color="inherit" 
            onClick={() => navigate('/appointments')}
          >
            Calendar
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/medical-records')}
          >
            Medical Records
          </Button>
          <Button 
            color="inherit" 
            onClick={handleDashboard}
          >
            Dashboard
          </Button>
          <Button 
            color="inherit" 
            onClick={handleLogout}
          >
            LogOut
          </Button>
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleDashboard}>Dashboard</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 