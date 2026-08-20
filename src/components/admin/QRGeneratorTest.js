// src/components/admin/QRGeneratorTest.js
import React from 'react';
import QRCodeDisplay from './QRCodeDisplay';

const QRGeneratorTest = () => {
  // Mock shift ID for testing
  const mockShiftId = 'SHIFT-' + Date.now();
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>QR Code Generator Test</h2>
      <QRCodeDisplay 
        shiftId={mockShiftId}
        shiftInfo={{
          employee: 'Test Employee',
          position: 'Developer',
          date: new Date().toLocaleDateString(),
          startTime: '09:00 AM',
          endTime: '05:00 PM',
          location: 'Buea Office (47WP+W6J)'
        }}
      />
    </div>
  );
};

export default QRGeneratorTest;