#!/bin/bash

# Script to check and potentially fix RLS policies for events table

SUPABASE_URL="https://ttsharxrnbcqbmllvgwa.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODQ1NzcsImV4cCI6MjA2Nzg2MDU3N30.ppN6WLAS5R5G0RJ6vBBxye4zBHk-fhNhAlWklTeNeJw"

echo "Testing events table access..."

# Test SELECT
echo -e "\n1. Testing SELECT access:"
curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/events?limit=1" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" | jq '.[0] | {id, title}'

# Test UPDATE
echo -e "\n2. Testing UPDATE access (dry run - no actual update):"
# Get an event ID first
EVENT_ID=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/events?limit=1" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" | jq -r '.[0].id')

echo "Event ID to test: $EVENT_ID"

# Try to update (with no actual changes)
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/events?id=eq.${EVENT_ID}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"updated_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"}' | jq

echo -e "\nNote: If you see errors above, RLS policies may be blocking updates."
echo "To fix this, you'll need to update RLS policies in Supabase dashboard:"
echo "1. Go to Authentication > Policies"
echo "2. Check policies for 'events' table"
echo "3. Ensure UPDATE policy exists for authenticated or anon users"