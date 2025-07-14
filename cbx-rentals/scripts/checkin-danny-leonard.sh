#!/bin/bash

# Check in Danny Leonard

SUPABASE_URL="https://ttsharxrnbcqbmllvgwa.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODQ1NzcsImV4cCI6MjA2Nzg2MDU3N30.ppN6WLAS5R5G0RJ6vBBxye4zBHk-fhNhAlWklTeNeJw"

echo "Marking Danny Leonard as checked in..."

# Update Danny Leonard's check-in status
curl -X PATCH \
  "${SUPABASE_URL}/rest/v1/attendees?phone=eq.9195339314" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "checked_in": true
  }'

echo -e "\n\nDanny Leonard has been marked as checked in."