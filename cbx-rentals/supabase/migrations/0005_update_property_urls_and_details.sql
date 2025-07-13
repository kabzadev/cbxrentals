-- Update properties with actual VRBO URLs and details
UPDATE properties SET 
  listing_url = 'https://www.vrbo.com/1234127',
  bedrooms = 6,
  bathrooms = 4.0,
  sleeps = 12,
  property_type = 'Beach House'
WHERE name = 'Property 1';

UPDATE properties SET 
  listing_url = 'https://www.vrbo.com/1244150',
  bedrooms = 6,
  bathrooms = 3.5,
  sleeps = 12,
  property_type = 'Beach House'
WHERE name = 'Property 2';

UPDATE properties SET 
  listing_url = 'https://www.vrbo.com/2037172',
  bedrooms = 6,
  bathrooms = 3.0,
  sleeps = 12,
  property_type = 'Beach House'
WHERE name = 'Property 3';

UPDATE properties SET 
  listing_url = 'https://www.vrbo.com/2040523',
  bedrooms = 4,
  bathrooms = 2.5,
  sleeps = 8,
  property_type = 'Beach House'
WHERE name = 'Property 4';

-- Insert property images based on typical VRBO beach house photos
INSERT INTO property_images (property_id, image_url, caption, sort_order)
SELECT 
  p.id,
  i.image_url,
  i.caption,
  i.sort_order
FROM properties p
CROSS JOIN LATERAL (
  VALUES 
    -- Property 1 images (6BR Beach House)
    ('Property 1', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=600&fit=crop', 'Beach House Exterior', 1),
    ('Property 1', 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&h=600&fit=crop', 'Living Room', 2),
    ('Property 1', 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop', 'Kitchen', 3),
    ('Property 1', 'https://images.unsplash.com/photo-1522444120501-73c7fc642f7a?w=800&h=600&fit=crop', 'Master Bedroom', 4),
    ('Property 1', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', 'Ocean View', 5),
    -- Property 2 images (6BR Beach House)
    ('Property 2', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop', 'Beach House Front', 1),
    ('Property 2', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', 'Great Room', 2),
    ('Property 2', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop', 'Modern Kitchen', 3),
    ('Property 2', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=600&fit=crop', 'Bedroom Suite', 4),
    ('Property 2', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop', 'Beach Access', 5),
    -- Property 3 images (6BR Beach House)
    ('Property 3', 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=600&fit=crop', 'Ocean Front Property', 1),
    ('Property 3', 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800&h=600&fit=crop', 'Spacious Living Area', 2),
    ('Property 3', 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&h=600&fit=crop', 'Gourmet Kitchen', 3),
    ('Property 3', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop', 'Comfortable Bedroom', 4),
    ('Property 3', 'https://images.unsplash.com/photo-1527004760902-f2372cbc7d52?w=800&h=600&fit=crop', 'Beach Sunset View', 5),
    -- Property 4 images (4BR Beach House)
    ('Property 4', 'https://images.unsplash.com/photo-1430285561322-7808604715df?w=800&h=600&fit=crop', 'Cozy Beach House', 1),
    ('Property 4', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop', 'Open Floor Plan', 2),
    ('Property 4', 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop', 'Updated Kitchen', 3),
    ('Property 4', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop', 'Guest Bedroom', 4),
    ('Property 4', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop', 'Steps to Beach', 5)
) AS i(property_name, image_url, caption, sort_order)
WHERE p.name = i.property_name;