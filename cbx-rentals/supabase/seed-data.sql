-- Sample data for CBX Rentals

-- Insert sample properties
INSERT INTO public.properties (name, address, latitude, longitude, max_occupancy, price_per_night, listing_url) VALUES
('Oceanview Villa', '123 Beach Road, Miami, FL 33139', 25.7617, -80.1918, 8, 350.00, 'https://example.com/oceanview-villa'),
('Downtown Loft', '456 Main Street, Miami, FL 33131', 25.7751, -80.1947, 4, 200.00, 'https://example.com/downtown-loft'),
('Suburban House', '789 Palm Avenue, Coral Gables, FL 33134', 25.7489, -80.2577, 6, 275.00, 'https://example.com/suburban-house'),
('Beachfront Condo', '321 Ocean Drive, Miami Beach, FL 33139', 25.7907, -80.1300, 5, 425.00, 'https://example.com/beachfront-condo');

-- Insert sample attendees
INSERT INTO public.attendees (name, email, phone, has_rental_car, needs_airport_pickup) VALUES
('John Doe', 'john.doe@example.com', '+1-555-0101', true, false),
('Jane Smith', 'jane.smith@example.com', '+1-555-0102', false, true),
('Mike Johnson', 'mike.johnson@example.com', '+1-555-0103', true, false),
('Sarah Williams', 'sarah.williams@example.com', '+1-555-0104', false, true),
('David Brown', 'david.brown@example.com', '+1-555-0105', true, false),
('Emily Davis', 'emily.davis@example.com', '+1-555-0106', false, false),
('Chris Wilson', 'chris.wilson@example.com', '+1-555-0107', true, false),
('Lisa Anderson', 'lisa.anderson@example.com', '+1-555-0108', false, true),
('Tom Martinez', 'tom.martinez@example.com', '+1-555-0109', true, false),
('Amy Taylor', 'amy.taylor@example.com', '+1-555-0110', false, true);

-- Insert sample bookings (using subqueries to get IDs)
INSERT INTO public.bookings (attendee_id, property_id, arrival_date, exit_date, total_amount, paid)
SELECT 
    a.id,
    p.id,
    '2025-02-15'::date,
    '2025-02-20'::date,
    p.price_per_night * 5,
    true
FROM public.attendees a
CROSS JOIN public.properties p
WHERE a.email = 'john.doe@example.com' AND p.name = 'Oceanview Villa';

INSERT INTO public.bookings (attendee_id, property_id, arrival_date, exit_date, total_amount, paid)
SELECT 
    a.id,
    p.id,
    '2025-02-15'::date,
    '2025-02-20'::date,
    p.price_per_night * 5,
    false
FROM public.attendees a
CROSS JOIN public.properties p
WHERE a.email = 'jane.smith@example.com' AND p.name = 'Downtown Loft';

INSERT INTO public.bookings (attendee_id, property_id, arrival_date, exit_date, total_amount, paid)
SELECT 
    a.id,
    p.id,
    '2025-02-15'::date,
    '2025-02-19'::date,
    p.price_per_night * 4,
    true
FROM public.attendees a
CROSS JOIN public.properties p
WHERE a.email = 'mike.johnson@example.com' AND p.name = 'Suburban House';