import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { LocationOn, MyLocation, Save } from '@mui/icons-material';
import { apiRequest } from '../../utils/api';
import { getStoredUser } from '../../utils/authSession';
import { calculateDistance, formatDistance } from '../../utils/locationVerification';
import {
  DEFAULT_COUNTRY_CODE,
  getCountryConfig,
  normalizeNationalNumber,
  SUPPORTED_COUNTRIES
} from '../../utils/countryConfig';
import { DashboardHero, DashboardPage } from '../common/dashboardUi';

const TIMEZONES = [
  { label: 'UTC (No offset)', value: 'UTC' },
  { label: 'Africa/Douala (UTC+1 — Cameroon)', value: 'Africa/Douala' },
  { label: 'Africa/Lagos (UTC+1 — Nigeria)', value: 'Africa/Lagos' },
  { label: 'Africa/Nairobi (UTC+3 — Kenya/East Africa)', value: 'Africa/Nairobi' },
  { label: 'Africa/Johannesburg (UTC+2 — South Africa)', value: 'Africa/Johannesburg' },
  { label: 'Africa/Accra (UTC+0 — Ghana)', value: 'Africa/Accra' },
  { label: 'Africa/Abidjan (UTC+0 — Côte d\'Ivoire)', value: 'Africa/Abidjan' },
  { label: 'Africa/Dakar (UTC+0 — Senegal)', value: 'Africa/Dakar' },
  { label: 'Africa/Casablanca (UTC+1 — Morocco)', value: 'Africa/Casablanca' },
  { label: 'Europe/London (UTC+0/+1)', value: 'Europe/London' },
  { label: 'Europe/Paris (UTC+1/+2)', value: 'Europe/Paris' },
  { label: 'America/New_York (UTC-5/-4)', value: 'America/New_York' },
  { label: 'America/Chicago (UTC-6/-5)', value: 'America/Chicago' },
  { label: 'America/Los_Angeles (UTC-8/-7)', value: 'America/Los_Angeles' },
  { label: 'Asia/Dubai (UTC+4)', value: 'Asia/Dubai' },
  { label: 'Asia/Kolkata (UTC+5:30 — India)', value: 'Asia/Kolkata' },
  { label: 'Asia/Singapore (UTC+8)', value: 'Asia/Singapore' },
];

// Fix broken default Leaflet marker icons in webpack/CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DEFAULT_CENTER = [4.1025, 9.3908];
const DEFAULT_ZOOM = 17;
const MIN_GEOFENCE_RADIUS = 50;

// Handles map clicks to place the marker
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// Re-centres the map whenever the saved position changes
const MapCentre = ({ position, zoom }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (position) {
      map.setView(position, zoom || map.getZoom());
    }
  }, [map, position, zoom]);
  return null;
};

// Fixes blank-map issue when rendered inside a hidden/animated container
const MapInvalidator = () => {
  const map = useMapEvents({});
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

// Sample GPS briefly and use the most accurate fix available.
const getAccurateLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    let bestPosition = null;
    let settled = false;
    let watchId = null;

    const finish = () => {
      if (settled) return;
      settled = true;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);

      if (bestPosition) {
        resolve({
          latitude: bestPosition.coords.latitude,
          longitude: bestPosition.coords.longitude,
          accuracy: bestPosition.coords.accuracy
        });
      } else {
        reject(new Error('Location unavailable. Make sure GPS / location services are enabled.'));
      }
    };

    const timer = setTimeout(finish, 12000);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        bestPosition = !bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy
          ? pos
          : bestPosition;

        if (bestPosition.coords.accuracy <= 20) {
          clearTimeout(timer);
          finish();
        }
      },
      (err) => {
        clearTimeout(timer);
        if (watchId != null) navigator.geolocation.clearWatch(watchId);
        if (err.code === 1)
          reject(new Error('Location access denied. Please allow location in your browser settings.'));
        else if (err.code === 2)
          reject(new Error('Location unavailable. Make sure GPS / location services are enabled.'));
        else
          reject(new Error('Location request timed out. Please try again.'));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });

const GeofenceSettings = () => {
  const [markerPos, setMarkerPos] = useState(null);
  const [radius, setRadius] = useState(100);
  const [address, setAddress] = useState('');
  const [timezone, setTimezone] = useState('Africa/Douala');
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [companyPhone, setCompanyPhone] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [payrollDefaults, setPayrollDefaults] = useState({
    currency: 'XAF',
    taxRate: 0,
    pensionRate: 0,
    otherDeductionRate: 0,
    notes: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const markerRef = useRef(null);

  const user = getStoredUser() || {};
  const isBranch = user.role === 'branch_manager' || user.role === 'branch_hr';
  const geofenceEndpoint = isBranch ? '/branches/mine/geofence' : '/locations/geofence';

  // Load existing geofence on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest(geofenceEndpoint);
        if (data?.success && data.geofence?.latitude) {
          const { latitude, longitude, radius: r, address: a } = data.geofence;
          setMarkerPos([latitude, longitude]);
          setRadius(Math.max(r || 100, MIN_GEOFENCE_RADIUS));
          setAddress(a || '');
        }
        if (data?.timezone) setTimezone(data.timezone);
        if (data?.companyProfile) {
          const profile = data.companyProfile;
          const nextCountryCode = profile.countryCode || DEFAULT_COUNTRY_CODE;
          setCountryCode(nextCountryCode);
          setCompanyPhone(normalizeNationalNumber(profile.companyPhone || '', nextCountryCode));
          setRegistrationNumber(profile.registrationNumber || '');
          setPayrollDefaults({
            currency: profile.payrollDefaults?.currency || getCountryConfig(nextCountryCode).currency,
            taxRate: profile.payrollDefaults?.taxRate ?? 0,
            pensionRate: profile.payrollDefaults?.pensionRate ?? 0,
            otherDeductionRate: profile.payrollDefaults?.otherDeductionRate ?? 0,
            notes: profile.payrollDefaults?.notes || ''
          });
        }
      } catch { /* no saved geofence yet */ }
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocationSelect = useCallback((lat, lng) => {
    setMarkerPos([lat, lng]);
    setTestResult(null);
  }, []);

  // Draggable marker drop
  const handleMarkerDragEnd = useCallback(() => {
    const latLng = markerRef.current?.getLatLng();
    if (latLng) {
      setMarkerPos([latLng.lat, latLng.lng]);
      setTestResult(null);
    }
  }, []);

  // Nominatim address search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setAlert(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const results = await res.json();
      if (!results.length) {
        setAlert({ severity: 'warning', message: 'No results found. Try a more specific address.' });
        return;
      }
      const { lat, lon, display_name } = results[0];
      setMarkerPos([parseFloat(lat), parseFloat(lon)]);
      setAddress(display_name);
    } catch {
      setAlert({ severity: 'error', message: 'Address search failed. Check your internet connection.' });
    } finally {
      setSearching(false);
    }
  };

  // High-accuracy GPS location
  const handleUseMyLocation = async () => {
    setLocating(true);
    setLocationAccuracy(null);
    setTestResult(null);
    setAlert(null);
    try {
      const loc = await getAccurateLocation();
      setMarkerPos([loc.latitude, loc.longitude]);
      setLocationAccuracy(loc.accuracy);
      setAlert({
        severity: 'success',
        message: `Location captured with ±${Math.round(loc.accuracy)} m accuracy. Drag the pin to fine-tune if needed.`
      });
    } catch (err) {
      setAlert({ severity: 'error', message: err.message });
    } finally {
      setLocating(false);
    }
  };

  const handleTestLocation = async () => {
    if (!markerPos) return;
    setTesting(true);
    setTestResult(null);
    setAlert(null);
    try {
      const loc = await getAccurateLocation();
      const dist = calculateDistance(
        { latitude: loc.latitude, longitude: loc.longitude },
        { latitude: markerPos[0], longitude: markerPos[1] }
      );
      setTestResult({ distance: dist, inside: dist <= radius, accuracy: loc.accuracy });
    } catch (err) {
      setAlert({ severity: 'error', message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!markerPos) {
      setAlert({ severity: 'error', message: 'Please place a marker on the map first.' });
      return;
    }
    setSaving(true);
    setAlert(null);
    const normalizedRadius = Math.max(Number(radius) || 0, MIN_GEOFENCE_RADIUS);
    try {
      const data = await apiRequest(geofenceEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: markerPos[0],
          longitude: markerPos[1],
          radius: normalizedRadius,
          address,
          timezone,
          countryCode,
          companyPhone,
          registrationNumber,
          payrollDefaults
        })
      });
      if (data?.success) {
        setRadius(normalizedRadius);
        setAlert({
          severity: 'success',
          message: `Geofence saved! Employees must be within ${normalizedRadius} m of the pinned location to clock in or out.`
        });
      } else {
        setAlert({ severity: 'error', message: data?.message || 'Failed to save geofence.' });
      }
    } catch (err) {
      setAlert({ severity: 'error', message: err.message || 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const selectedCountry = getCountryConfig(countryCode);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Geofence Settings"
        title={`${isBranch ? 'Branch' : 'Company'} location and check-in zone.`}
        subtitle="Pin your location on the map and set the radius. Employees must be inside the geofence boundary to clock in or out."
        gradient="linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #7c3aed 100%)"
      />

      {alert && (
        <Alert severity={alert.severity} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Search + GPS row */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Find Location</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <TextField
              size="small"
              placeholder="Search address or place name…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={searching}
              startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <LocationOn />}
            >
              {searching ? 'Searching…' : 'Search'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleUseMyLocation}
              disabled={locating}
              startIcon={locating ? <CircularProgress size={16} color="inherit" /> : <MyLocation />}
            >
              {locating ? 'Getting location…' : 'Use My Location'}
            </Button>
          </Box>

          {locating && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Acquiring high-accuracy GPS fix (up to 8 s)…
              </Typography>
              <LinearProgress sx={{ mt: 0.5, borderRadius: 1 }} />
            </Box>
          )}

          {address && !locating && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {address}
            </Typography>
          )}
          {locationAccuracy != null && !locating && (
            <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
              GPS accuracy: ±{Math.round(locationAccuracy)} m
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, pt: 1.5, pb: 0.5 }}>
            Click on the map to place the centre, or drag the pin to reposition.
          </Typography>
          <Box sx={{ height: 440, width: '100%' }}>
            <MapContainer
              center={markerPos || DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapInvalidator />
              <MapClickHandler onLocationSelect={handleLocationSelect} />
              {markerPos && <MapCentre position={markerPos} zoom={18} />}
              {markerPos && (
                <>
                  <Marker
                    position={markerPos}
                    draggable
                    ref={markerRef}
                    eventHandlers={{ dragend: handleMarkerDragEnd }}
                  />
                  <Circle
                    center={markerPos}
                    radius={radius}
                    pathOptions={{ color: '#1976d2', fillColor: '#1976d2', fillOpacity: 0.13, weight: 2 }}
                  />
                </>
              )}
            </MapContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Radius slider */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Geofence Radius:&nbsp;
            <Typography component="span" fontWeight={700} color="primary">{radius} m</Typography>
          </Typography>
          <Slider
            value={Math.max(radius, MIN_GEOFENCE_RADIUS)}
            min={MIN_GEOFENCE_RADIUS}
            max={200}
            step={5}
            onChange={(_, v) => { setRadius(v); setTestResult(null); }}
            marks={[
              { value: MIN_GEOFENCE_RADIUS,  label: '50 m' },
              { value: 100, label: '100 m' },
              { value: 150, label: '150 m' },
              { value: 200, label: '200 m' }
            ]}
            valueLabelDisplay="auto"
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            Employees must be within this radius to clock in or out.{' '}
            <strong>Use 100 m or more</strong> when testing indoors or on a desktop — GPS can be 30–100 m off in these environments.
          </Typography>
        </CardContent>
      </Card>

      {/* Coords summary */}
      {markerPos && (
        <Card sx={{ mb: 2, bgcolor: '#f0f4f8' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Lat/Lng:</strong> {markerPos[0].toFixed(6)}, {markerPos[1].toFixed(6)}
              &nbsp;·&nbsp;
              <strong>Radius:</strong> {radius} m
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Timezone */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Company Timezone</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            This timezone is used to calculate check-in windows. Make sure it matches the city your office is in.
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Timezone</InputLabel>
            <Select value={timezone} label="Timezone" onChange={e => setTimezone(e.target.value)}>
              {TIMEZONES.map(tz => (
                <MenuItem key={tz.value} value={tz.value}>{tz.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {!isBranch && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Company Compliance Profile</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Set the country and the default deduction rates AutoPay should apply whenever payroll is generated.
            </Typography>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Country</InputLabel>
                <Select
                  value={countryCode}
                  label="Country"
                  onChange={(e) => {
                    const nextCountryCode = e.target.value;
                    const nextCountry = getCountryConfig(nextCountryCode);
                    setCountryCode(nextCountryCode);
                    setCompanyPhone((prev) => normalizeNationalNumber(prev, nextCountryCode));
                    setPayrollDefaults((prev) => ({ ...prev, currency: nextCountry.currency }));
                    if (!timezone) setTimezone(nextCountry.timezone);
                  }}
                >
                  {SUPPORTED_COUNTRIES.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.name} ({country.dialCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Company phone"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(normalizeNationalNumber(e.target.value, countryCode))}
                helperText={`${selectedCountry.dialCode} + ${selectedCountry.phoneDigits} digits`}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {selectedCountry.dialCode}
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                size="small"
                label={selectedCountry.registrationLabel}
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
                <TextField
                  size="small"
                  label="PAYE / tax %"
                  type="number"
                  value={payrollDefaults.taxRate}
                  onChange={(e) => setPayrollDefaults((prev) => ({ ...prev, taxRate: e.target.value }))}
                />
                <TextField
                  size="small"
                  label="Pension / SSNIT %"
                  type="number"
                  value={payrollDefaults.pensionRate}
                  onChange={(e) => setPayrollDefaults((prev) => ({ ...prev, pensionRate: e.target.value }))}
                />
                <TextField
                  size="small"
                  label="Other deduction %"
                  type="number"
                  value={payrollDefaults.otherDeductionRate}
                  onChange={(e) => setPayrollDefaults((prev) => ({ ...prev, otherDeductionRate: e.target.value }))}
                />
              </Box>

              <TextField
                size="small"
                label="Deduction notes"
                value={payrollDefaults.notes}
                onChange={(e) => setPayrollDefaults((prev) => ({ ...prev, notes: e.target.value }))}
                multiline
                minRows={2}
                helperText={`Currency defaults to ${payrollDefaults.currency || selectedCountry.currency}. Use these fields for your company's approved rates.`}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      <Button
        variant="contained"
        size="large"
        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
        onClick={handleSave}
        disabled={saving || !markerPos}
        sx={{ px: 5 }}
      >
        {saving ? 'Saving…' : 'Save Geofence & Timezone'}
      </Button>

      {markerPos && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleTestLocation}
            disabled={testing}
            startIcon={testing ? <CircularProgress size={16} color="inherit" /> : <MyLocation />}
          >
            {testing ? 'Getting location…' : 'Test: Am I Inside the Geofence?'}
          </Button>
          {testResult && (
            <Alert
              severity={testResult.inside ? 'success' : 'error'}
              sx={{ mt: 1.5 }}
              onClose={() => setTestResult(null)}
            >
              <strong>{testResult.inside ? 'Inside ✓' : 'Outside ✗'}</strong>
              {' '}— you are {formatDistance(testResult.distance)} from the pin
              {' '}(GPS accuracy ±{Math.round(testResult.accuracy)} m).
              {!testResult.inside && (
                <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                  Either move closer to the pin, or increase the radius above{' '}
                  <strong>{Math.ceil(testResult.distance)} m</strong> to include your current position.
                </Box>
              )}
            </Alert>
          )}
        </Box>
      )}
    </DashboardPage>
  );
};

export default GeofenceSettings;
