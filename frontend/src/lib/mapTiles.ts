import type { Map, TileLayer } from 'leaflet';

type LeafletModule = typeof import('leaflet');

// Google Maps Satellite + Hybrid (Satellite imagery with road & place labels)
const GOOGLE_HYBRID_TILES = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key={key}';

// ESRI World Imagery (Global high-res satellite imagery, 100% free with no API key requirement)
const ESRI_SATELLITE_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

function addEsriFallback(L: LeafletModule, map: Map): TileLayer {
  return L.tileLayer(ESRI_SATELLITE_TILES, {
    maxZoom: 19,
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  }).addTo(map);
}

export function addBaseTileLayer(L: LeafletModule, map: Map): TileLayer {
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  if (!googleKey) {
    return addEsriFallback(L, map);
  }

  const googleLayer = L.tileLayer(
    GOOGLE_HYBRID_TILES.replace('{key}', encodeURIComponent(googleKey)),
    {
      maxZoom: 20,
      attribution: '&copy; Google Maps',
    },
  ).addTo(map);

  googleLayer.once('tileerror', () => {
    console.warn('[MapTiles] Google tile error, switching to high-res ESRI satellite layer');
    if (map.hasLayer(googleLayer)) {
      map.removeLayer(googleLayer);
    }
    addEsriFallback(L, map);
  });

  return googleLayer;
}
