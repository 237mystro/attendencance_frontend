import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_COUNTRY_CODE, getCountryConfig, normalizeNationalNumber } from '@/constants/countries';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { calculateDistance, getUserLocation } from '@/lib/geolocation';
import { geocodeAddress } from '@/api/geocoding';
import { fetchGeofence, saveGeofence } from '@/api/geofence';
import { MIN_GEOFENCE_RADIUS_METRES } from '../geofence-rules';

const DEFAULT_RADIUS = 100;

const emptyPayrollDefaults = {
  currency: 'XAF',
  taxRate: 0,
  pensionRate: 0,
  otherDeductionRate: 0,
  notes: '',
};

/**
 * Loads, edits, tests, and saves the attendance boundary.
 *
 * The same endpoint carries the company profile fields (timezone, phone,
 * registration number, payroll defaults), so they are managed here too rather
 * than being split across two requests.
 */
export function useGeofenceSettings() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [position, setPosition] = useState(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [address, setAddress] = useState('');
  const [timezone, setTimezone] = useState('Africa/Douala');
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [companyPhone, setCompanyPhone] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [payrollDefaults, setPayrollDefaults] = useState(emptyPayrollDefaults);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const role = currentUser?.role;

  useEffect(() => {
    let active = true;

    fetchGeofence(role)
      .then((data) => {
        if (!active) return;

        if (data?.success && data.geofence?.latitude) {
          setPosition([data.geofence.latitude, data.geofence.longitude]);
          setRadius(Math.max(data.geofence.radius || DEFAULT_RADIUS, MIN_GEOFENCE_RADIUS_METRES));
          setAddress(data.geofence.address || '');
        }
        if (data?.timezone) setTimezone(data.timezone);

        if (data?.companyProfile) {
          const profile = data.companyProfile;
          const code = profile.countryCode || DEFAULT_COUNTRY_CODE;
          setCountryCode(code);
          setCompanyPhone(normalizeNationalNumber(profile.companyPhone || '', code));
          setRegistrationNumber(profile.registrationNumber || '');
          setPayrollDefaults({
            currency: profile.payrollDefaults?.currency || getCountryConfig(code).currency,
            taxRate: profile.payrollDefaults?.taxRate ?? 0,
            pensionRate: profile.payrollDefaults?.pensionRate ?? 0,
            otherDeductionRate: profile.payrollDefaults?.otherDeductionRate ?? 0,
            notes: profile.payrollDefaults?.notes || '',
          });
        }
      })
      .catch(() => {
        // No boundary configured yet — the blank form is the correct state.
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [role]);

  const selectPosition = useCallback((latitude, longitude) => {
    setPosition([latitude, longitude]);
    setTestResult(null);
  }, []);

  /** Drops the pin on the administrator's own position. */
  const useMyLocation = useCallback(async () => {
    setLocating(true);
    setTestResult(null);
    try {
      const fix = await getUserLocation();
      setPosition([fix.latitude, fix.longitude]);
      setAccuracy(fix.accuracy);
      toast.success(
        `Location captured to ±${Math.round(fix.accuracy)} m. Drag the pin to fine-tune.`,
      );
    } catch (caught) {
      toast.error(caught?.message || 'Could not read your location.');
    } finally {
      setLocating(false);
    }
  }, [toast]);

  /** Free-text address lookup, dropping the pin on the first match. */
  const searchAddress = useCallback(
    async (query) => {
      if (!query.trim()) return;
      setSearching(true);
      try {
        const match = await geocodeAddress(query);
        if (!match) {
          toast.warn('No results found. Try a more specific address.');
          return;
        }
        setPosition([match.latitude, match.longitude]);
        setAddress(match.label);
      } catch {
        toast.error('Address search failed. Check your internet connection.');
      } finally {
        setSearching(false);
      }
    },
    [toast],
  );

  /** Checks whether the administrator's own position passes the boundary. */
  const testFromHere = useCallback(async () => {
    if (!position) return;
    setTesting(true);
    setTestResult(null);
    try {
      const fix = await getUserLocation();
      const distance = calculateDistance(
        { latitude: fix.latitude, longitude: fix.longitude },
        { latitude: position[0], longitude: position[1] },
      );
      setTestResult({ distance, inside: distance <= radius, accuracy: fix.accuracy });
    } catch (caught) {
      toast.error(caught?.message || 'Could not read your location.');
    } finally {
      setTesting(false);
    }
  }, [position, radius, toast]);

  const save = useCallback(async () => {
    if (!position) {
      toast.error('Place a marker on the map first.');
      return;
    }

    setSaving(true);
    const normalizedRadius = Math.max(Number(radius) || 0, MIN_GEOFENCE_RADIUS_METRES);

    try {
      const data = await saveGeofence(role, {
        latitude: position[0],
        longitude: position[1],
        radius: normalizedRadius,
        address,
        timezone,
        countryCode,
        companyPhone,
        registrationNumber,
        payrollDefaults,
      });

      if (!data?.success) throw new Error(data?.message || 'Failed to save geofence.');

      setRadius(normalizedRadius);
      toast.success(
        `Geofence saved. Employees must be within ${normalizedRadius} m of the pin to clock in or out.`,
      );
    } catch (caught) {
      toast.error(caught?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [
    position, radius, address, timezone, countryCode,
    companyPhone, registrationNumber, payrollDefaults, role, toast,
  ]);

  return {
    loading, saving, locating, searching, testing, testResult, accuracy,
    position, radius, address, timezone, countryCode,
    companyPhone, registrationNumber, payrollDefaults,
    setRadius, setAddress, setTimezone, setCountryCode,
    setCompanyPhone, setRegistrationNumber, setPayrollDefaults,
    selectPosition, useMyLocation, searchAddress, testFromHere, save,
  };
}
