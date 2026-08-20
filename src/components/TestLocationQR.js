// src/components/TestLocationQR.js
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import QRScanner from './employee/QRScanner';

const TestLocationQR = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Location-Based QR Check-In Test
      </Typography>
      
      <Box sx={{ mb: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          How This Works:
        </Typography>
        <Typography variant="body1" paragraph>
          1. Click "Verify Location & Scan QR" to get your phone's location
        </Typography>
        <Typography variant="body1" paragraph>
          2. System verifies you're within 20 meters of Buea office (47WP+W6J)
        </Typography>
        <Typography variant="body1" paragraph>
          3. If verified, you can scan a QR code to check in
        </Typography>
        <Typography variant="body1">
          4. Attendance is automatically recorded in admin dashboard
        </Typography>
      </Box>
      
      <QRScanner />
    </Container>
  );
};

export default TestLocationQR;