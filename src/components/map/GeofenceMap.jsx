import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useMemo, useRef } from 'react';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

/**
 * Leaflet ships its marker images as separate files and resolves them with a
 * relative URL that a bundler rewrites. Pointing the default icon at the
 * imported asset URLs is what stops the pin rendering as a broken image.
 */
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [4.1025, 9.3908];
const DEFAULT_ZOOM = 17;

/** Places the pin wherever the map is clicked. */
function ClickToPlace({ onSelect }) {
  useMapEvents({
    click: (event) => onSelect(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

/** Recentres when the pin moves somewhere off-screen, and fixes sizing. */
function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    // A map created inside a collapsed or animating container measures itself
    // as zero-height and renders grey; remeasure once it has settled.
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [map, position]);

  return null;
}

/**
 * Interactive boundary picker: click or drag the pin to move it, with the
 * radius drawn to scale so the covered area is obvious before saving.
 */
export function GeofenceMap({ position, radius, onSelect }) {
  const markerRef = useRef(null);

  const dragHandlers = useMemo(
    () => ({
      dragend: () => {
        const latLng = markerRef.current?.getLatLng();
        if (latLng) onSelect(latLng.lat, latLng.lng);
      },
    }),
    [onSelect],
  );

  return (
    <div className="h-80 w-full overflow-hidden rounded-panel border border-line sm:h-96 dark:border-line-dark">
      <MapContainer
        center={position || DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="size-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickToPlace onSelect={onSelect} />
        <MapController position={position} />

        {position && (
          <>
            <Marker
              position={position}
              draggable
              ref={markerRef}
              eventHandlers={dragHandlers}
            />
            <Circle
              center={position}
              radius={radius}
              pathOptions={{
                color: '#155eef',
                fillColor: '#155eef',
                fillOpacity: 0.15,
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
