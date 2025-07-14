#!/bin/bash

# Add Danny Leonard as an off-site attendee via Supabase API

SUPABASE_URL="https://ttsharxrnbcqbmllvgwa.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODQ1NzcsImV4cCI6MjA2Nzg2MDU3N30.ppN6WLAS5R5G0RJ6vBBxye4zBHk-fhNhAlWklTeNeJw"

echo "Adding Danny Leonard as off-site attendee..."

curl -X POST \
  "${SUPABASE_URL}/rest/v1/attendees" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Danny Leonard",
    "email": "danny.leonard@offsite.com",
    "phone": "9195339314",
    "has_rental_car": false,
    "needs_airport_pickup": false,
    "interested_in_carpool": false,
    "checked_in": false
  }'

echo -e "\n\nDanny Leonard has been added as an off-site attendee."