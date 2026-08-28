import { useCallback, useMemo, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { geocodeAddress } from '@/api/geocoding';
import { MIN_GEOFENCE_RADIUS_METRES } from '@/features/attendance/geofence-rules';
import { useApi } from '@/hooks/useApi';
import { getUserLocation } from '@/lib/geolocation';
import { fetchBranchGeofence, saveBranchGeofence } from '@/api/branches';

const DEFAULT_RADIUS = 100;

/**
 * Loads and edits one branch's boundary inside a dialog.
 *
 * The saved boundary is fetched, and the editable values are a *draft laid over
 * it* rather than state copied into an effect. Nothing has to be reset when the
 * fetch lands: until the user touches a field, the saved value shows through.
 *
 * Shares the radius floor with the company-wide geofence, so a branch cannot be
 * given a boundary tighter than GPS can satisfy.
 */
export function useBranchGeofence(branch, { onSaved } = {}) {
  const toast = useToast();
  const branchId = branch?._id;

  const query = useApi((signal) => fetchBranchGeofence(branchId, signal), [branchId], {
    enabled: Boolean(branchId),
  });

  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);

  const saved = query.data?.success ? query.data.geofence : null;

  // Memoised on the fetched object, which is stable, so `save` is not rebuilt
  // on every keystroke by a fresh array literal.
  const savedPosition = useMemo(
    () => (saved && saved.latitude ? [saved.latitude, saved.longitude] : null),
    [saved],
  );
  const position = draft.position !== undefined ? draft.position : savedPosition;

  const radius =
    draft.radius ??
    (saved?.radius
      ? Math.max(saved.radius, MIN_GEOFENCE_RADIUS_METRES)
      : DEFAULT_RADIUS);

  const address = draft.address ?? saved?.address ?? '';

  const patch = useCallback((changes) => {
    setDraft((current) => ({ ...current, ...changes }));
  }, []);

  const selectPosition = useCallback(
    (latitude, longitude) => patch({ position: [latitude, longitude] }),
    [patch],
  );

  const useMyLocation = useCallback(async () => {
    setLocating(true);
    try {
      const fix = await getUserLocation();
      patch({ position: [fix.latitude, fix.longitude] });
      toast.success(
        `Location captured to ±${Math.round(fix.accuracy)} m. Drag the pin to fine-tune.`,
      );
    } catch (caught) {
      toast.error(caught?.message || 'Could not read your location.');
    } finally {
      setLocating(false);
    }
  }, [patch, toast]);

  const searchAddress = useCallback(
    async (query_) => {
      if (!query_.trim()) return;
      setSearching(true);
      try {
        const match = await geocodeAddress(query_);
        if (!match) {
          toast.warn('No results found. Try a more specific address.');
          return;
        }
        patch({ position: [match.latitude, match.longitude], address: match.label });
      } catch {
        toast.error('Address search failed. Check your internet connection.');
      } finally {
        setSearching(false);
      }
    },
    [patch, toast],
  );

  const save = useCallback(async () => {
    if (!position) {
      toast.error('Place a marker on the map first.');
      return;
    }

    setSaving(true);
    const normalizedRadius = Math.max(Number(radius) || 0, MIN_GEOFENCE_RADIUS_METRES);

    try {
      const data = await saveBranchGeofence(branchId, {
        latitude: position[0],
        longitude: position[1],
        radius: normalizedRadius,
        address,
      });
      if (!data?.success) throw new Error(data?.message || 'Save failed.');

      patch({ radius: normalizedRadius });
      toast.success(`Geofence saved — ${normalizedRadius} m radius.`);
      onSaved?.();
    } catch (caught) {
      toast.error(caught?.message || 'Could not save the geofence.');
    } finally {
      setSaving(false);
    }
  }, [position, radius, address, branchId, patch, toast, onSaved]);

  return {
    position,
    radius,
    address,
    loading: query.loading,
    saving,
    locating,
    searching,
    setRadius: (value) => patch({ radius: value }),
    setAddress: (value) => patch({ address: value }),
    selectPosition,
    useMyLocation,
    searchAddress,
    save,
  };
}
