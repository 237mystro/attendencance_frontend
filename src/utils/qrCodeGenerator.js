// src/utils/qrCodeGenerator.js
import { QRCodeCanvas } from 'qrcode.react';

// Generate QR code data for a shift
export const generateShiftQRData = (shiftId, timestamp = Date.now()) => {
  // Create a unique token for this shift
  const token = btoa(`${shiftId}-${timestamp}-${Math.random()}`).substring(0, 32);

  // Create QR data with shift ID and token
  return JSON.stringify({
    shiftId,
    token,
    timestamp,
    location: 'Buea-Office'
  });
};

// Render QR code as a React component
export const ShiftQRCode = ({ qrData, ...props }) => (
  <QRCodeCanvas value={qrData} size={256} {...props} />
);

// Verify QR code data
export const verifyQRData = (qrData) => {
  try {
    const data = JSON.parse(qrData);
    
    // Check if required fields exist
    if (!data.shiftId || !data.token || !data.timestamp) {
      return { valid: false, message: 'Invalid QR code format' };
    }
    
    // Check if it's not expired (5 minutes)
    const now = Date.now();
    if (now - data.timestamp > 5 * 60 * 1000) {
      return { valid: false, message: 'QR code has expired' };
    }
    
    return { valid: true, data };
  } catch (err) {
    return { valid: false, message: 'Invalid QR code format' };
  }
};