-- First, delete existing events if any
DELETE FROM public.events;

-- Insert CBX Experience Events for 2025
INSERT INTO public.events (title, description, event_date, event_time, is_optional, location_name, location_address, location_latitude, location_longitude, map_url) VALUES
    -- Official Events
    ('Welcome Reception & Check-In', 'Kick off CBX 2025! Check into your beach house, meet your housemates, and join us for welcome drinks and appetizers on the beach. This is where you''ll receive your welcome packet and event schedule.', '2025-09-10', '16:00:00', false, 'Beach Pavilion', 'Oceanside Pier, Oceanside, CA 92054', 33.1929, -117.3859, 'https://maps.google.com/?q=33.1929,-117.3859'),
    
    ('Opening Night Beach BBQ', 'Join us for an unforgettable beach BBQ featuring live music, local craft beers, and delicious grilled specialties. Vegetarian and vegan options available. Dress code: Beach casual.', '2025-09-10', '19:00:00', false, 'Main Beach Fire Pits', 'The Strand, Oceanside, CA 92054', 33.1936, -117.3861, 'https://maps.google.com/?q=33.1936,-117.3861'),
    
    ('CBX Conference Day', 'Full day of keynote speakers, panel discussions, and networking sessions. Continental breakfast and lunch provided. Business casual attire recommended.', '2025-09-11', '08:30:00', false, 'Oceanside Convention Center', '300 N Coast Hwy, Oceanside, CA 92054', 33.1965, -117.3827, 'https://maps.google.com/?q=33.1965,-117.3827'),
    
    ('Closing Gala Dinner', 'Celebrate the conclusion of CBX 2025 with an elegant beachfront dinner. Awards ceremony, special recognitions, and dancing under the stars. Cocktail attire requested.', '2025-09-13', '18:30:00', false, 'The Seabird Resort', '101 Mission Ave, Oceanside, CA 92054', 33.1933, -117.3856, 'https://maps.google.com/?q=33.1933,-117.3856'),
    
    -- Optional Events
    ('Sunrise Beach Yoga', 'Start your day with energizing beach yoga led by a certified instructor. All levels welcome. Mats and blocks provided. Meet at the beach 10 minutes early.', '2025-09-11', '06:30:00', true, 'Buccaneer Beach', '1506 S Pacific St, Oceanside, CA 92054', 33.1872, -117.3813, 'https://maps.google.com/?q=33.1872,-117.3813'),
    
    ('Deep Sea Fishing Charter', 'Half-day fishing excursion on a fully equipped charter boat. All gear provided. Includes light breakfast and beverages. Limited to 12 participants. $125 per person.', '2025-09-12', '06:00:00', true, 'Oceanside Harbor', '1540 Harbor Dr N, Oceanside, CA 92054', 33.2059, -117.3912, 'https://maps.google.com/?q=33.2059,-117.3912'),
    
    ('Craft Brewery Tour', 'Explore Oceanside''s thriving craft beer scene with guided tastings at 3 local breweries. Includes transportation and light snacks. Must be 21+. $65 per person.', '2025-09-12', '14:00:00', true, 'Pickup at Beach Pavilion', 'Oceanside Pier, Oceanside, CA 92054', 33.1929, -117.3859, 'https://maps.google.com/?q=33.1929,-117.3859'),
    
    ('Beach Bonfire & S''mores', 'Casual evening gathering around beach fire pits. Enjoy s''mores, acoustic music, and stargazing. BYOB welcome. Family-friendly event.', '2025-09-12', '19:30:00', true, 'Buccaneer Beach Fire Pits', '1506 S Pacific St, Oceanside, CA 92054', 33.1872, -117.3813, 'https://maps.google.com/?q=33.1872,-117.3813');