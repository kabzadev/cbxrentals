#!/bin/bash

echo "Testing events table update capability..."

SUPABASE_URL="https://ttsharxrnbcqbmllvgwa.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODQ1NzcsImV4cCI6MjA2Nzg2MDU3N30.ppN6WLAS5R5G0RJ6vBBxye4zBHk-fhNhAlWklTeNeJw"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.tO4dhbqkEJbQQJuvZdy8LAKzrLV84ezqR89XuIHLJa8"

# Get first event
echo "1. Fetching an event..."
EVENT=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/events?limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

EVENT_ID=$(echo $EVENT | jq -r '.[0].id')
EVENT_TITLE=$(echo $EVENT | jq -r '.[0].title')

echo "   Found event: $EVENT_TITLE (ID: $EVENT_ID)"

# Test update with anon key
echo -e "\n2. Testing update with anon key..."
ANON_UPDATE=$(curl -s -w "\n%{http_code}" -X PATCH \
  "${SUPABASE_URL}/rest/v1/events?id=eq.${EVENT_ID}" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"updated_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"}'
)

HTTP_CODE=$(echo "$ANON_UPDATE" | tail -n1)
RESPONSE=$(echo "$ANON_UPDATE" | head -n-1)

echo "   HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 204 ]; then
    echo "   ✅ Update successful with anon key"
else
    echo "   ❌ Update failed with anon key"
    echo "   Response: $RESPONSE"
fi

# Test update with service key
echo -e "\n3. Testing update with service role key..."
SERVICE_UPDATE=$(curl -s -w "\n%{http_code}" -X PATCH \
  "${SUPABASE_URL}/rest/v1/events?id=eq.${EVENT_ID}" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"updated_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"}'
)

HTTP_CODE=$(echo "$SERVICE_UPDATE" | tail -n1)
RESPONSE=$(echo "$SERVICE_UPDATE" | head -n-1)

echo "   HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 204 ]; then
    echo "   ✅ Update successful with service key"
    echo "   Response: $(echo $RESPONSE | jq -c '.[] | {id, title, updated_at}' 2>/dev/null || echo $RESPONSE)"
else
    echo "   ❌ Update failed with service key"
    echo "   Response: $RESPONSE"
fi

echo -e "\n4. Diagnosis:"
if [ "$HTTP_CODE" -eq 406 ]; then
    echo "   The 406 error indicates RLS policies are blocking the update."
    echo "   You need to fix the RLS policies in the Supabase dashboard."
elif [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 204 ]; then
    echo "   Updates are working! The issue might be with the frontend code."
else
    echo "   Unexpected error. Check the response above."
fi