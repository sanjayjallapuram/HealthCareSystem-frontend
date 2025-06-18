import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import config from '../config';

const DoctorRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    specialty: '',
    qualification: '',
    yearsOfExperience: '',
    bio: '',
    languages: [],
    certifications: [],
    workingHours: [],
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData({
        ...formData,
        languages: [...formData.languages, newLanguage]
      });
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (language) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(l => l !== language)
    });
  };

  const handleAddCertification = () => {
    if (newCertification && !formData.certifications.includes(newCertification)) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification]
      });
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (certification) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter(c => c !== certification)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/doctor-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          role: 'ROLE_DOCTOR'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Update auth context
      const loginSuccess = await login(data);
      if (!loginSuccess) {
        throw new Error('Failed to update authentication state');
      }

      showNotification('Registration successful!', 'success');
      navigate('/doctor-dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom color="primary">
          Doctor Registration
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Create your doctor account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="yearsOfExperience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Languages
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    label="Add Language"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddLanguage}
                    disabled={!newLanguage}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.languages.map((language) => (
                    <Chip
                      key={language}
                      label={language}
                      onDelete={() => handleRemoveLanguage(language)}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Certifications
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    label="Add Certification"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddCertification}
                    disabled={!newCertification}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.certifications.map((certification) => (
                    <Chip
                      key={certification}
                      label={certification}
                      onDelete={() => handleRemoveCertification(certification)}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/doctor-login" color="primary">
              Login as Doctor
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Are you a patient?{' '}
            <Link component={RouterLink} to="/patient-register" color="primary">
              Register as Patient
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default DoctorRegister; 