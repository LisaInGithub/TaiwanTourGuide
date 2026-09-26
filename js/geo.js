import { DESTINATIONS } from './data.js';

export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function nearbyAttractions(lat, lng, limit = 6) {
  return DESTINATIONS.flatMap((d) => d.attractions.map((a) => ({ ...a, destId: d.id, destName: d.name })))
    .map((a) => ({ ...a, km: distanceKm(lat, lng, a.lat, a.lng) }))
    .sort((x, y) => x.km - y.km)
    .slice(0, limit);
}

export function nearestDestination(lat, lng) {
  return DESTINATIONS.map((d) => ({ d, km: distanceKm(lat, lng, d.lat, d.lng) })).sort((x, y) => x.km - y.km)[0].d;
}

export function mapsUrl(name) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
}

export function transitUrl(fromName, toName) {
  const p = new URLSearchParams({ api: '1', origin: fromName, destination: toName, travelmode: 'transit' });
  return `https://www.google.com/maps/dir/?${p}`;
}
