-- Add Off-site property for attendees staying elsewhere
INSERT INTO public.properties (
    name, 
    address, 
    latitude, 
    longitude, 
    max_occupancy, 
    price_per_night, 
    listing_url,
    bedrooms,
    bathrooms,
    sleeps,
    property_type
) VALUES (
    'Off-site', 
    'Various Locations', 
    33.1950,  -- General Oceanside coordinates
    -117.3795, 
    20,  -- High capacity since multiple people might be off-site
    0.00,  -- No charge for off-site
    NULL,  -- No listing URL
    0,  -- No bedrooms
    0,  -- No bathrooms
    0,  -- No sleeps count
    'off-site'
) ON CONFLICT (name) DO NOTHING;  -- Don't insert if it already exists