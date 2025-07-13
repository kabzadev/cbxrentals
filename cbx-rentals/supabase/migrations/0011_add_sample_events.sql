-- Add sample events only if the events table is empty
INSERT INTO public.events (title, description, event_date, event_time, is_optional, location_name, location_address, location_latitude, location_longitude, map_url)
SELECT * FROM (VALUES
    -- Official Events (4)
    ('Welcome Reception & Check-In', 'Kick off CBX 2025! Check into your beach house, meet your housemates, and join us for welcome drinks and appetizers on the beach.', '2025-09-10', '16:00:00', false, 'Beach Pavilion', 'Oceanside Pier, Oceanside, CA 92054', 33.1929, -117.3859, 'https://maps.google.com/?q=33.1929,-117.3859'),
    
    ('Opening Night Beach BBQ', 'Beach BBQ featuring live music, local craft beers, and grilled specialties. Vegetarian and vegan options available.', '2025-09-10', '19:00:00', false, 'Main Beach', 'The Strand, Oceanside, CA 92054', 33.1936, -117.3861, 'https://maps.google.com/?q=33.1936,-117.3861'),
    
    ('CBX Conference Day', 'Full day of keynote speakers, panel discussions, and networking. Breakfast and lunch provided.', '2025-09-11', '08:30:00', false, 'Convention Center', '300 N Coast Hwy, Oceanside, CA 92054', 33.1965, -117.3827, 'https://maps.google.com/?q=33.1965,-117.3827'),
    
    ('Closing Gala Dinner', 'Elegant beachfront dinner with awards ceremony and dancing. Cocktail attire requested.', '2025-09-13', '18:30:00', false, 'The Seabird Resort', '101 Mission Ave, Oceanside, CA 92054', 33.1933, -117.3856, 'https://maps.google.com/?q=33.1933,-117.3856')
) AS v(title, description, event_date, event_time, is_optional, location_name, location_address, location_latitude, location_longitude, map_url)
WHERE NOT EXISTS (SELECT 1 FROM public.events LIMIT 1);