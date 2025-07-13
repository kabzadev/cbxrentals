-- Reset all attendee check-in and transportation data to defaults
UPDATE attendees 
SET 
    checked_in = FALSE,
    check_in_time = NULL,
    has_rental_car = NULL,
    needs_airport_pickup = FALSE,
    interested_in_carpool = FALSE;

-- Reset all booking payment status to unpaid
UPDATE bookings 
SET 
    paid = FALSE;