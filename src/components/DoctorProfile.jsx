import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Divider, Chip, Rating, Box, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DoctorService } from '../services/DoctorService';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 800,
  margin: '20px auto',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  borderRadius: '12px',
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const InfoSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const DoctorProfile = ({ doctorId }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        // setLoading(true);
        const profileData = await DoctorService.getDoctorProfile(doctorId);
        console.log(profileData);
        setDoctor(profileData);
        setError(null);
      } catch (err) {
        setError('Failed to load doctor profile. Please try again later.');
        console.error('Error loading doctor profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorProfile();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, margin: '20px auto' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!doctor) {
    return (
      <Box sx={{ maxWidth: 800, margin: '20px auto' }}>
        <Alert severity="info">No doctor profile found.</Alert>
      </Box>
    );
  }

  const {
    username,
    email,
    fullName,
    specialty,
    qualification,
    yearsOfExperience,
    bio,
    languages,
    averageRating,
    numberOfReviews,
    reviews,
    isAvailable,
    phoneNumber,
    address,
    certifications,
  } = doctor;

  return (
    <StyledCard>
      <ProfileHeader>
        <Avatar
          sx={{ width: 120, height: 120 }}
          alt={fullName}
          src="/default-avatar.png"
        />
        <Box>
          <Typography variant="h4" gutterBottom>
            Dr. {fullName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {specialty}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={averageRating} readOnly precision={0.5} />
            <Typography variant="body2" color="text.secondary">
              ({numberOfReviews} reviews)
            </Typography>
          </Box>
          <Chip
            label={isAvailable ? 'Available' : 'Not Available'}
            color={isAvailable ? 'success' : 'error'}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>
      </ProfileHeader>

      <Divider sx={{ my: 3 }} />

      <InfoSection>
        <Typography variant="h6" gutterBottom>
          Professional Information
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Qualification:</strong> {qualification}
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Experience:</strong> {yearsOfExperience} years
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Languages:</strong> {languages?.join(', ') || 'Not specified'}
        </Typography>
      </InfoSection>

      <InfoSection>
        <Typography variant="h6" gutterBottom>
          About
        </Typography>
        <Typography variant="body1" paragraph>
          {bio || 'No bio available'}
        </Typography>
      </InfoSection>

      <InfoSection>
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Email:</strong> {email}
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Phone:</strong> {phoneNumber}
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Address:</strong> {address}
        </Typography>
      </InfoSection>

      {certifications && certifications.length > 0 && (
        <InfoSection>
          <Typography variant="h6" gutterBottom>
            Certifications
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {certifications.map((cert, index) => (
              <Chip key={index} label={cert} variant="outlined" />
            ))}
          </Box>
        </InfoSection>
      )}

      {reviews && reviews.length > 0 && (
        <InfoSection>
          <Typography variant="h6" gutterBottom>
            Recent Reviews
          </Typography>
          {reviews.map((review, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {review.date}
                </Typography>
              </Box>
              <Typography variant="body1">{review.comment}</Typography>
            </Box>
          ))}
        </InfoSection>
      )}
    </StyledCard>
  );
};

export default DoctorProfile; 