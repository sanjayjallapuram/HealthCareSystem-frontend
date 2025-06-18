import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../context/AuthContext';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = 'appointments';
      
      if (user.roles.includes('ROLE_DOCTOR')) {
        endpoint = `appointments/doctor/name/${user.username}`;
      } else if (user.roles.includes('ROLE_PATIENT')) {
        endpoint = `appointments/patient/name/${user.username}`;
      }

      const response = await fetch(`http://localhost:8080/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      
      // Transform appointments for calendar view
      const calendarEvents = data.map(appointment => ({
        id: appointment.id,
        title: `${appointment.patientName ? 'Patient: ' + appointment.patientName : ''}${appointment.doctorName ? ' Doctor: Dr. ' + appointment.doctorName : ''} - ${appointment.reason}`,
        start: new Date(appointment.startTime),
        end: new Date(new Date(appointment.startTime).getTime() + 60 * 60 * 1000), // 1 hour duration
        status: appointment.status,
      }));

      setAppointments(calendarEvents);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad'; // default color

    switch (event.status) {
      case 'CONFIRMED':
        backgroundColor = '#4caf50';
        break;
      case 'CANCELLED':
        backgroundColor = '#f44336';
        break;
      case 'COMPLETED':
        backgroundColor = '#9e9e9e';
        break;
      case 'PENDING':
        backgroundColor = '#ff9800';
        break;
      default:
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
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
            <Typography variant="h4" gutterBottom>
              Appointments Calendar
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ height: 600, mt: 3 }}>
              <Calendar
                localizer={localizer}
                events={appointments}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
                defaultView="week"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Appointments; 