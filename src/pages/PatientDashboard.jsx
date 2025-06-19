import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';


const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openBooking, setOpenBooking] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [bookingData, setBookingData] = useState({
    doctorId: '',
    date: null,
    time: '',
    reason: '',
  });
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openRecordDialog, setOpenRecordDialog] = useState(false);
  const [videoCallError, setVideoCallError] = useState('');
  const [bookingValidationError, setBookingValidationError] = useState('');

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Log the request details
      const requestUrl = `${API_BASE_URLL}/appointments/patient/name/${user.username}`;
      console.log('Making request to:', requestUrl);
      console.log('With headers:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });

      // Fetch appointments using username
      const appointmentsResponse = await fetch(requestUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', appointmentsResponse.status);
      console.log('Response headers:', Object.fromEntries(appointmentsResponse.headers.entries()));

      if (!appointmentsResponse.ok) {
        const errorText = await appointmentsResponse.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch appointments: ${errorText}`);
      }

      const data = await appointmentsResponse.json();
      console.log('Raw appointments data:', JSON.stringify(data, null, 2));
      
      if (!Array.isArray(data)) {
        console.error('Unexpected appointments data format:', data);
        throw new Error('Invalid appointments data format');
      }

      // Sort appointments by date and time
      const sortedAppointments = data.sort((a, b) => {
        const dateA = new Date(a.startTime || `${a.date}T${a.time}`);
        const dateB = new Date(b.startTime || `${b.date}T${b.time}`);
        return dateA - dateB;
      });

      console.log('Sorted appointments:', JSON.stringify(sortedAppointments, null, 2));

      // Add doctor details to each appointment
      console.log('Fetching doctor details...');
      const appointmentsWithDoctors = await Promise.all(sortedAppointments.map(async (appointment) => {
        try {
          const doctorUrl = `${API_BASE_URL}/doctor/${appointment.doctorId}`;
          console.log(`Fetching doctor details from: ${doctorUrl}`);
          
          const doctorResponse = await fetch(doctorUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (doctorResponse.ok) {
            const doctorData = await doctorResponse.json();
            console.log(`Doctor data for appointment ${appointment.id}:`, doctorData);
            return {
              ...appointment,
              doctorName: doctorData.username || 'Unknown Doctor'
            };
          }
          console.warn(`Failed to fetch doctor details for appointment ${appointment.id}:`, {
            status: doctorResponse.status,
            statusText: doctorResponse.statusText
          });
          return {
            ...appointment,
            doctorName: 'Unknown Doctor'
          };
        } catch (error) {
          console.error(`Error fetching doctor details for appointment ${appointment.id}:`, error);
          return {
            ...appointment,
            doctorName: 'Unknown Doctor'
          };
        }
      }));

      console.log('Final appointments data:', JSON.stringify(appointmentsWithDoctors, null, 2));

      // Fetch medical records for each appointment
      const appointmentsWithRecords = await Promise.all(appointmentsWithDoctors.map(async (appointment) => {
        try {
          const recordResponse = await fetch(`${API_BASE_URL}/medical-records/appointment/${appointment.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (recordResponse.ok) {
            const records = await recordResponse.json();
            return {
              ...appointment,
              medicalRecords: records
            };
          }
          return {
            ...appointment,
            medicalRecords: []
          };
        } catch (error) {
          console.error('Error fetching medical records:', error);
          return {
            ...appointment,
            medicalRecords: []
          };
        }
      }));

      console.log('Appointments with records:', JSON.stringify(appointmentsWithRecords, null, 2));
      setAppointments(appointmentsWithRecords);
      setError(null);
    } catch (err) {
      console.error('Error in fetchAppointments:', err);
      setError(err.message || 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user.username]);

  // Add effect to log when appointments change
  useEffect(() => {
    console.log('Appointments state updated:', appointments);
  }, [appointments]);

  const fetchDoctors = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching doctors with token:', token);
      
      const response = await fetch(`${API_BASE_URL}/doctor`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      const data = await response.json();
      console.log('Raw doctor data:', JSON.stringify(data, null, 2));
      
      // Ensure we have the correct data structure
      const formattedDoctors = data.map(doctor => {
        console.log('Processing doctor:', doctor);
        return {
          _id: doctor.id || doctor._id,
          fullName: doctor.fullName || doctor.username,
          username: doctor.username,
          specialty: doctor.specialty || doctor.speciality || 'General Medicine'
        };
      });
      
      console.log('Formatted doctors:', JSON.stringify(formattedDoctors, null, 2));
      setDoctors(formattedDoctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors');
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [fetchAppointments, fetchDoctors]);

  const handleBookingSubmit = async () => {
    setBookingValidationError('');
    try {
      // Frontend validation for time and date
      if (!bookingData.date || !bookingData.time) {
        setBookingValidationError('Please select both date and time.');
        return;
      }

      if (!bookingData.doctorId) {
        setBookingValidationError('Please select a doctor.');
        return;
      }

      const selectedDate = new Date(bookingData.date);
      const [hour, minute] = bookingData.time.split(':').map(Number);
      selectedDate.setHours(hour, minute, 0, 0);
      
      // Add 5 minutes to current time for minimum appointment time
      const now = new Date();
      const minAppointmentTime = new Date(now.getTime() + 5 * 60000);

      // Check if appointment is at least 5 minutes in the future
      if (selectedDate < minAppointmentTime) {
        setBookingValidationError('Appointment must be at least 5 minutes in the future.');
        return;
      }

      // Check if appointment is during working hours (9 AM to 5 PM)
      if (hour < 9 || hour >= 17) {
        setBookingValidationError('Appointments must be between 9:00 AM and 5:00 PM.');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Format date as YYYY-MM-DD without timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      // Create the appointment data
      const appointmentData = {
        patientId: user.username,
        doctorId: bookingData.doctorId,
        time: bookingData.time,
        date: formattedDate,
        durationInMinutes: 30,
        reason: bookingData.reason,
        status: 'PENDING'
      };

      // Show loading state
      setLoading(true);

      // Make the API call
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to book appointment');
      }

      // Get the newly created appointment
      const newAppointment = await response.json();

      // Close the dialog and show success message immediately
      setOpenBooking(false);
      setSuccessMessage('Appointment booked successfully!');
      
      // Reset booking form
      setBookingData({
        doctorId: '',
        date: null,
        time: '',
        reason: '',
      });

      // Refresh appointments in the background
      fetchAppointments();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error cancelling appointment:', errorText);
        throw new Error('Failed to cancel appointment');
      }

      await fetchAppointments();
      setSuccessMessage('Appointment cancelled successfully');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment');
    }
  };

  const handleViewRecord = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/medical-records/appointment/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const records = await response.json();
        if (records && records.length > 0) {
          setSelectedRecord(records[0]);  // Show the most recent record
          setOpenRecordDialog(true);
        } else {
          setError('No medical records found for this appointment');
        }
      } else {
        throw new Error('Failed to fetch medical record');
      }
    } catch (err) {
      console.error('Error fetching medical record:', err);
      setError('Failed to load medical record');
    }
  };

  const handleJoinVideoCall = (appointment) => {
    // Navigate directly to video call room
    navigate(`/video-call/${appointment.id}?role=patient&userId=${user.id || user.username}&userName=${encodeURIComponent(user.username)}`);
  };

  const canCancelAppointment = (appointment) => {
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      return false;
    }
    
    // Get appointment date/time
    const appointmentDate = new Date(appointment.startTime);
    const now = new Date();
    
    // Can't cancel appointments less than 1 hour before
    const hourBeforeAppointment = new Date(appointmentDate.getTime() - (60 * 60 * 1000));
    return now < hourBeforeAppointment;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'COMPLETED':
        return 'info';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBookAppointment = (doctor) => {
    if (!doctor || !doctor._id) {
      console.error('Invalid doctor data:', doctor);
      return;
    }
    setBookingData({
      doctorId: doctor._id,
      date: null,
      time: '',
      reason: '',
    });
    setOpenBooking(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" gutterBottom>
                Welcome, {user?.username}
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={fetchAppointments}
                  sx={{ mr: 2 }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenBooking(true)}
                >
                  Book Appointment
                </Button>
              </Box>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              Your Appointments
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Medical Record</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((appointment) => {
                        const appointmentDate = appointment.startTime 
                          ? new Date(appointment.startTime)
                          : new Date(`${appointment.date}T${appointment.time}`);
                        
                        return (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              {/* <Link to={`/doctor-profile/${appointment.doctorId}`} style={{ textDecoration: 'none', color: 'primary.main' }}> */}
                                Dr. {appointment.doctorName || 'Loading...'}
                              {/* </Link> */}
                            </TableCell>
                            <TableCell>
                              {appointmentDate.toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                            <TableCell>
                              {appointment.durationInMinutes} minutes
                            </TableCell>
                            <TableCell>{appointment.reason}</TableCell>
                            <TableCell>
                              <Chip
                                label={appointment.status}
                                color={getStatusColor(appointment.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {appointment.medicalRecords && appointment.medicalRecords.length > 0 && (
                                <Button
                                  size="small"
                                  color="info"
                                  onClick={() => handleViewRecord(appointment.id)}
                                >
                                  View Record
                                </Button>
                              )}
                            </TableCell>
                            <TableCell>
                              {canCancelAppointment(appointment) && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                              {appointment.status === 'CONFIRMED' && (
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  sx={{ ml: 1 }}
                                  onClick={() => handleJoinVideoCall(appointment)}
                                >
                                  Start Video Call
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={openBooking} onClose={() => {
        setOpenBooking(false);
        setBookingData({
          doctorId: '',
          date: null,
          time: '',
          reason: '',
        });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Book an Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {bookingValidationError && (
              <Alert severity="error" sx={{ mb: 2 }}>{bookingValidationError}</Alert>
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Doctor</InputLabel>
              <Select
                value={bookingData.doctorId || ''}
                onChange={(e) => {
                  const selectedDoctorId = e.target.value;
                  console.log('Selected doctor ID:', selectedDoctorId);
                  console.log('Available doctors:', doctors);
                  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId || d._id === selectedDoctorId);
                  console.log('Selected doctor:', selectedDoctor);
                  setBookingData(prev => ({
                    ...prev,
                    doctorId: selectedDoctorId
                  }));
                }}
                label="Doctor"
                error={!bookingData.doctorId && bookingValidationError}
              >
                {doctors && doctors.length > 0 ? (
                  doctors.map((doctor) => {
                    const doctorId = doctor.id || doctor._id;
                    const doctorName = doctor.username || doctor.fullName;
                    const doctorSpecialty = doctor.specialty;
                    console.log('Rendering doctor:', { 
                      id: doctorId, 
                      name: doctorName, 
                      specialty: doctorSpecialty,
                      fullDoctor: doctor 
                    });
                    return (
                      <MenuItem key={doctorId} value={doctorId}>
                        Dr. {doctorName} - {doctorSpecialty}
                      </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem disabled>No doctors available</MenuItem>
                )}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={bookingData.date}
                onChange={(newDate) => setBookingData({ ...bookingData, date: newDate })}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal'
                  }
                }}
              />
            </LocalizationProvider>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Time</InputLabel>
              <Select
                value={bookingData.time}
                onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                label="Time"
              >
                <MenuItem value="09:00">09:00 AM</MenuItem>
                <MenuItem value="10:00">10:00 AM</MenuItem>
                <MenuItem value="11:00">11:00 AM</MenuItem>
                <MenuItem value="12:00">12:00 AM</MenuItem>
                <MenuItem value="14:00">02:00 PM</MenuItem>
                <MenuItem value="15:00">03:00 PM</MenuItem>
                <MenuItem value="16:00">04:00 PM</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Reason for Visit"
              multiline
              rows={4}
              value={bookingData.reason}
              onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenBooking(false);
            setBookingData({
              doctorId: '',
              date: null,
              time: '',
              reason: '',
            });
          }}>Cancel</Button>
          <Button
            onClick={handleBookingSubmit}
            variant="contained"
            disabled={!bookingData.doctorId || !bookingData.date || !bookingData.time || !bookingData.reason}
          >
            Book Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Medical Record Dialog */}
      <Dialog
        open={openRecordDialog}
        onClose={() => setOpenRecordDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Medical Record
          <Typography variant="subtitle2" color="text.secondary">
            {selectedRecord && formatDate(selectedRecord.createdAt)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Diagnosis</Typography>
                <Typography>{selectedRecord.diagnosis}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Symptoms</Typography>
                <Typography>{selectedRecord.symptoms || 'Not specified'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Notes</Typography>
                <Typography>{selectedRecord.notes || 'No notes'}</Typography>
              </Grid>

              {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Medications</Typography>
                  {selectedRecord.medications.map((med, index) => (
                    <Typography key={index}>
                      • {med.name} - {med.dosage}, {med.frequency}, {med.duration}
                    </Typography>
                  ))}
                </Grid>
              )}

              {selectedRecord.vitalSigns && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Vital Signs</Typography>
                  <Typography>
                    Temperature: {selectedRecord.vitalSigns.temperature}°C
                    <br />
                    Blood Pressure: {selectedRecord.vitalSigns.bloodPressureSystolic}/{selectedRecord.vitalSigns.bloodPressureDiastolic} mmHg
                    <br />
                    Heart Rate: {selectedRecord.vitalSigns.heartRate} bpm
                    <br />
                    Respiratory Rate: {selectedRecord.vitalSigns.respiratoryRate} breaths/min
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRecordDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Video Call Error Dialog */}
      <Dialog open={!!videoCallError} onClose={() => setVideoCallError('')}>
        <DialogTitle>Video Call Unavailable</DialogTitle>
        <DialogContent>
          <Typography>{videoCallError}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVideoCallError('')}>OK</Button>
        </DialogActions>
      </Dialog>

      
    </Container>
  );
};

export default PatientDashboard; 