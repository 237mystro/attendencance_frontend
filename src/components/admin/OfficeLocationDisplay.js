// src/components/admin/OfficeLocationDisplay.js
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Chip
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

const OfficeLocationDisplay = () => {
  const officeCoordinates = {
    latitude: parseFloat(process.env.REACT_APP_OFFICE_LATITUDE) || 4.1025,
    longitude: parseFloat(process.env.REACT_APP_OFFICE_LONGITUDE) || 9.3908
  };

  const radius = parseInt(process.env.REACT_APP_VERIFICATION_RADIUS) || 20;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ fontSize: 30, color: 'primary.main', mr: 1 }} />
          <Typography variant="h6">
            Office Location: Buea (47WP+W6J)
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={`Verification Radius: ${radius} meters`} 
            color="primary" 
            variant="outlined" 
            sx={{ mr: 1 }}
          />
          <Chip 
            label={`Coordinates: ${officeCoordinates.latitude.toFixed(6)}, ${officeCoordinates.longitude.toFixed(6)}`} 
            variant="outlined" 
          />
        </Box>
        
        <Box sx={{ height: 300, borderRadius: 1, overflow: 'hidden' }}>
          <MapContainer 
            center={[officeCoordinates.latitude, officeCoordinates.longitude]} 
            zoom={17} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[officeCoordinates.latitude, officeCoordinates.longitude]}>
              <Popup>
                <strong>Office Location</strong><br />
                Buea (47WP+W6J)<br />
                Verification Radius: {radius}m
              </Popup>
            </Marker>
          </MapContainer>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Employees must be within {radius} meters of this location to check in.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default OfficeLocationDisplay;