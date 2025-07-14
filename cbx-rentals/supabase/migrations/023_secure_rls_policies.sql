"-- Drop existing permissive policies
DROP POLICY IF EXISTS \"Allow all operations on properties\" ON public.properties;
DROP POLICY IF EXISTS \"Allow all operations on attendees\" ON public.attendees;
DROP POLICY IF EXISTS \"Allow all operations on bookings\" ON public.bookings;

-- Properties table policies
CREATE POLICY \"Allow read for authenticated on properties\" ON public.properties
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY \"Allow all for admin on properties\" ON public.properties
    FOR ALL USING ((auth.jwt() ->> 'user_role') = 'admin');

-- Attendees table policies
CREATE POLICY \"Allow read for authenticated on attendees\" ON public.attendees
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY \"Allow all for admin on attendees\" ON public.attendees
    FOR ALL USING ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY \"Allow attendees to update own data\" ON public.attendees
    FOR UPDATE USING (auth.uid() = id);

-- Bookings table policies
CREATE POLICY \"Allow read for authenticated on bookings\" ON public.bookings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY \"Allow all for admin on bookings\" ON public.bookings
    FOR ALL USING ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY \"Allow attendees to view own bookings\" ON public.bookings
    FOR SELECT USING (auth.uid() = attendee_id);

CREATE POLICY \"Allow attendees to update own bookings\" ON public.bookings
    FOR UPDATE USING (auth.uid() = attendee_id);
