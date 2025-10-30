import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface PropertyMapProps {
  location: string;
  title: string;
  latitude?: string | null;
  longitude?: string | null;
}

// Coordinates for common Dhaka locations (fallback)
const DHAKA_LOCATIONS: Record<string, [number, number]> = {
  "Gulshan": [23.7808, 90.4164],
  "Banani": [23.7938, 90.4043],
  "Dhanmondi": [23.7461, 90.3742],
  "Motijheel": [23.7334, 90.4182],
  "Uttara": [23.8759, 90.3795],
  "Bashundhara": [23.8223, 90.4259],
  "Baridhara": [23.8103, 90.4125],
  "Mohakhali": [23.7808, 90.3918],
  "Mirpur": [23.8223, 90.3654],
  "Default": [23.8103, 90.4125], // Dhaka center
};

export function PropertyMap({ location, title, latitude, longitude }: PropertyMapProps) {
  // Use database coordinates if available, otherwise fallback to location matching
  const getCoordinates = (): [number, number] => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
    
    // Fallback to location name matching
    for (const [area, coords] of Object.entries(DHAKA_LOCATIONS)) {
      if (location.toLowerCase().includes(area.toLowerCase())) {
        return coords;
      }
    }
    return DHAKA_LOCATIONS.Default;
  };

  const coordinates = getCoordinates();

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border" data-testid="property-map">
      <MapContainer
        center={coordinates}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        data-testid="leaflet-map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coordinates}>
          <Popup>
            <div className="p-2">
              <p className="font-semibold mb-1">{title}</p>
              <p className="text-sm text-muted-foreground">{location}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
