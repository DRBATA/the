import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Venue } from "../lib/venues";

// Fix for default marker icons in many build setups
if (typeof window !== "undefined" && L.Icon.Default) {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
}

interface Props {
  venues: Venue[];
  center?: [number, number];
  zoom?: number;
}

export function RefillMap({
  venues,
  center = [25.20, 55.27],
  zoom = 11,
}: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {venues.map((v) => (
        <Marker
          key={v.id}
          position={[v.coordinates.latitude, v.coordinates.longitude]}
          icon={L.icon({
            iconUrl: '/logoright.png',
            iconSize: [48, 48],
            iconAnchor: [24, 48], // bottom center
            popupAnchor: [0, -48],
            shadowUrl: undefined,
          })}
        >
          <Popup>
            <div className="btn">
              <strong>{v.name}</strong>
              <br />
              {v.hook}
              <br />
              <a
                href={v.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn text-xs"
                style={{
                  textDecoration: "underline",
                  color: "var(--primary-blue)",
                  backgroundImage: "var(--button-gradient)",
                }}
              >
                Open in Maps
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
