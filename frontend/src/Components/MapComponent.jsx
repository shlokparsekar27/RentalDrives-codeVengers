// src/Components/MapComponent.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaMapMarkerAlt, FaCar } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

// Fix for default Leaflet marker icons in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Icon
const createCustomIcon = (price, theme) => {
    const isDark = theme === 'dark';
    const bgColor = isDark ? 'bg-slate-100' : 'bg-slate-900';
    const textColor = isDark ? 'text-slate-900' : 'text-white';
    const borderColor = isDark ? 'border-slate-900' : 'border-white';
    const triangleColor = isDark ? 'border-t-slate-100' : 'border-t-slate-900';

    const html = renderToStaticMarkup(
        <div className="relative group">
            <div className={`${bgColor} ${textColor} font-bold text-xs px-2 py-1 rounded-md shadow-lg border ${borderColor} whitespace-nowrap transform group-hover:scale-110 transition-transform`}>
                ₹{price}
            </div>
            <div className={`absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] ${triangleColor}`}></div>
        </div>
    );

    return divIcon({
        html: html,
        className: 'bg-transparent',
        iconSize: [40, 40],
        iconAnchor: [20, 30]
    });
};

const MapComponent = ({ vehicles = [] }) => {
    const { theme } = useTheme();

    // Default center to Goa
    const defaultCenter = [15.2993, 74.1240];

    const tileLayerUrl = theme === 'dark'
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    return (
        <MapContainer
            center={defaultCenter}
            zoom={10}
            style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
            className={`z-0 ${theme === 'dark' ? 'leaflet-dark-mode' : ''}`}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={tileLayerUrl}
            />

            {vehicles.map((vehicle) => {
                const lat = vehicle.latitude || (defaultCenter[0] + (Math.random() - 0.5) * 0.2);
                const lng = vehicle.longitude || (defaultCenter[1] + (Math.random() - 0.5) * 0.2);

                return (
                    <Marker
                        key={vehicle.id}
                        position={[lat, lng]}
                        icon={createCustomIcon(vehicle.price_per_day, theme)}
                    >
                        <Popup className="custom-popup">
                            <div className="w-48 p-1">
                                <img
                                    src={vehicle.image_urls?.[0]}
                                    alt={vehicle.model}
                                    className="w-full h-24 object-cover rounded-md mb-2"
                                />
                                <h3 className="font-bold text-slate-900 text-sm">{vehicle.make} {vehicle.model}</h3>
                                <p className="text-xs text-slate-500 mb-2">{vehicle.transmission} • {vehicle.fuel_type}</p>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-blue-600">₹{vehicle.price_per_day}/day</span>
                                    <a href={`/vehicle/${vehicle.id}`} className="block bg-slate-900 text-white text-xs px-2 py-1 rounded hover:bg-slate-700 transition-colors">
                                        View
                                    </a>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default MapComponent;
