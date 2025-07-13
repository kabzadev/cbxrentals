-- Insert CBX Experience Events
INSERT INTO public.events (title, description, event_date, event_time, is_optional, location_name, location_address, location_latitude, location_longitude) VALUES
    -- Official Events
    ('Welcome Reception', 'Join us for a welcome reception to kick off the CBX Experience! Meet your fellow attendees and enjoy drinks and appetizers by the beach.', '2024-09-10', '18:00:00', false, 'Beach Pavilion', 'Oceanside Pier, Oceanside, CA 92054', 33.1929, -117.3859),
    
    ('Group Dinner', 'Enjoy a delicious group dinner at one of Oceanside''s finest restaurants. Menu includes seafood, vegetarian, and vegan options.', '2024-09-11', '19:00:00', false, 'Oceanside Restaurant', '333 N Pacific St, Oceanside, CA 92054', 33.1947, -117.3831),
    
    ('Beach Activities', 'Fun beach activities including volleyball, frisbee, and sandcastle building. Bring your sunscreen!', '2024-09-12', '10:00:00', false, 'Main Beach', 'The Strand, Oceanside, CA 92054', 33.1936, -117.3861),
    
    ('Farewell Brunch', 'Join us for a farewell brunch to wrap up the CBX Experience. Share your favorite moments and exchange contact information.', '2024-09-14', '11:00:00', false, 'Beachfront Café', '1963 S Coast Hwy, Oceanside, CA 92054', 33.1778, -117.3663),
    
    -- Optional Events
    ('Sunrise Yoga', 'Start your day with a peaceful yoga session on the beach. All levels welcome. Mats provided.', '2024-09-11', '06:30:00', true, 'South Beach', 'Buccaneer Beach, Oceanside, CA 92054', 33.1872, -117.3813),
    
    ('Harbor Cruise', 'Optional 2-hour sunset cruise around Oceanside Harbor. Limited to 20 guests. $45 per person.', '2024-09-11', '17:00:00', true, 'Oceanside Harbor', '1540 Harbor Dr N, Oceanside, CA 92054', 33.2059, -117.3912),
    
    ('Golf Outing', 'Join us for 18 holes at the Oceanside Golf Course. Tee time at 8:00 AM. Green fees not included.', '2024-09-12', '08:00:00', true, 'Oceanside Golf Course', '825 Douglas Dr, Oceanside, CA 92058', 33.2072, -117.3515),
    
    ('Wine Tasting Tour', 'Visit local wineries in the nearby Temecula Valley. Transportation provided. $75 per person includes tastings.', '2024-09-13', '13:00:00', true, 'Pickup at Property 1', '1724 S Pacific St, Oceanside, CA', 33.1892, -117.3847),
    
    ('Karaoke Night', 'Optional karaoke night for those who want to show off their singing skills! Drinks and snacks available for purchase.', '2024-09-13', '20:00:00', true, 'The Pour House', '1903 S Coast Hwy, Oceanside, CA 92054', 33.1785, -117.3660);

-- Update events with Google Maps URLs
UPDATE public.events SET map_url = 
    CASE 
        WHEN location_name = 'Beach Pavilion' THEN 'https://maps.google.com/?q=33.1929,-117.3859'
        WHEN location_name = 'Oceanside Restaurant' THEN 'https://maps.google.com/?q=33.1947,-117.3831'
        WHEN location_name = 'Main Beach' THEN 'https://maps.google.com/?q=33.1936,-117.3861'
        WHEN location_name = 'Beachfront Café' THEN 'https://maps.google.com/?q=33.1778,-117.3663'
        WHEN location_name = 'South Beach' THEN 'https://maps.google.com/?q=33.1872,-117.3813'
        WHEN location_name = 'Oceanside Harbor' THEN 'https://maps.google.com/?q=33.2059,-117.3912'
        WHEN location_name = 'Oceanside Golf Course' THEN 'https://maps.google.com/?q=33.2072,-117.3515'
        WHEN location_name = 'Pickup at Property 1' THEN 'https://maps.google.com/?q=33.1892,-117.3847'
        WHEN location_name = 'The Pour House' THEN 'https://maps.google.com/?q=33.1785,-117.3660'
        ELSE map_url
    END;