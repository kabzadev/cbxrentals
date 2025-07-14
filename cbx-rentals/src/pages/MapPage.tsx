import { useCallback, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MapPin, Home, Users } from 'lucide-react';
import { Badge } from '../components/ui/badge';

// House data with coordinates
const houses = [
  {
    id: 1,
    name: 'House 1',
    address: '3116 Waterway Pl, Carlsbad, CA 92009',
    coordinates: { lat: 33.0836, lng: -117.3108 },
    bedrooms: 4,
    bathrooms: 3,
    maxOccupancy: 8,
    color: '#FF6B6B'
  },
  {
    id: 2,
    name: 'House 2',
    address: '1427 Summit Ave, Carlsbad, CA 92008',
    coordinates: { lat: 33.1580, lng: -117.3505 },
    bedrooms: 3,
    bathrooms: 2,
    maxOccupancy: 6,
    color: '#4ECDC4'
  },
  {
    id: 3,
    name: 'House 3',
    address: '215 Walnut Ave, Carlsbad, CA 92008',
    coordinates: { lat: 33.1609, lng: -117.3476 },
    bedrooms: 4,
    bathrooms: 3,
    maxOccupancy: 8,
    color: '#FFE66D'
  },
  {
    id: 4,
    name: 'House 4',
    address: '205 Elm Ave, Carlsbad, CA 92008',
    coordinates: { lat: 33.1607, lng: -117.3481 },
    bedrooms: 3,
    bathrooms: 2,
    maxOccupancy: 6,
    color: '#95E1D3'
  }
];

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

// Center the map around Carlsbad
const center = {
  lat: 33.1215,
  lng: -117.3287
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
};

export function MapPage() {
  const [selectedHouse, setSelectedHouse] = useState<typeof houses[0] | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    // Fit all markers on the map
    const bounds = new google.maps.LatLngBounds();
    houses.forEach(house => {
      bounds.extend(house.coordinates);
    });
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // For now, use a placeholder API key message
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!googleMapsApiKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              CBX Rentals House Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Google Maps API key not configured.</p>
              <p className="text-sm text-gray-500">To enable the interactive map, add VITE_GOOGLE_MAPS_API_KEY to your environment variables.</p>
            </div>
            
            {/* Show house list as fallback */}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {houses.map((house) => (
                <Card key={house.id} className="border-2" style={{ borderColor: house.color }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" style={{ color: house.color }} />
                      {house.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      {house.address}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span>{house.bedrooms} bedrooms</span>
                      <span>{house.bathrooms} bathrooms</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4" />
                      <span>Max {house.maxOccupancy} guests</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            CBX Rentals House Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <LoadScript googleMapsApiKey={googleMapsApiKey}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={options}
            >
              {houses.map((house) => (
                <Marker
                  key={house.id}
                  position={house.coordinates}
                  onClick={() => setSelectedHouse(house)}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: house.color,
                    fillOpacity: 0.9,
                    strokeColor: '#000',
                    strokeWeight: 2,
                  }}
                />
              ))}

              {selectedHouse && (
                <InfoWindow
                  position={selectedHouse.coordinates}
                  onCloseClick={() => setSelectedHouse(null)}
                >
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <Home className="h-5 w-5" style={{ color: selectedHouse.color }} />
                      {selectedHouse.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{selectedHouse.address}</p>
                    <div className="space-y-1">
                      <p className="text-sm">{selectedHouse.bedrooms} bedrooms, {selectedHouse.bathrooms} bathrooms</p>
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Max {selectedHouse.maxOccupancy} guests
                      </Badge>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>

          {/* House list below map */}
          <div className="p-6 border-t">
            <h3 className="text-lg font-semibold mb-4">All Houses</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {houses.map((house) => (
                <div
                  key={house.id}
                  className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderColor: house.color, borderWidth: '2px' }}
                  onClick={() => {
                    setSelectedHouse(house);
                    map?.panTo(house.coordinates);
                    map?.setZoom(16);
                  }}
                >
                  <h4 className="font-semibold flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: house.color }}
                    />
                    {house.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{house.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {house.bedrooms}BR / {house.bathrooms}BA • Max {house.maxOccupancy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}