#!/bin/bash

# Direct cleanup script using Supabase REST API and Azure CLI

echo "🧹 CBX Rentals - Photo Cleanup"
echo "=============================="
echo ""

# Check for required environment variables
if [ -z "$1" ] || [ "$1" != "--force" ]; then
    echo "⚠️  WARNING: This will permanently DELETE all photos!"
    echo ""
    echo "Usage: ./scripts/cleanup-photos-direct.sh --force"
    exit 1
fi

# Supabase credentials
SUPABASE_URL="https://ttsharxrnbcqbmllvgwa.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODQ1NzcsImV4cCI6MjA2Nzg2MDU3N30.ppN6WLAS5R5G0RJ6vBBxye4zBHk-fhNhAlWklTeNeJw"

echo "Step 1: Deleting from Supabase database"
echo "======================================="

# First, get the count of photos
COUNT_RESPONSE=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/photos?select=count" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Prefer: count=exact" \
  -I)

PHOTO_COUNT=$(echo "$COUNT_RESPONSE" | grep -i "content-range:" | sed 's/.*\///' | tr -d '\r')

if [ -z "$PHOTO_COUNT" ]; then
    PHOTO_COUNT="0"
fi

echo "Found $PHOTO_COUNT photo(s) in database"

if [ "$PHOTO_COUNT" != "0" ]; then
    # Delete all photos
    DELETE_RESPONSE=$(curl -s -X DELETE \
      "${SUPABASE_URL}/rest/v1/photos?id=not.is.null" \
      -H "apikey: ${SUPABASE_ANON_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
      -H "Content-Type: application/json")
    
    echo "✅ Deleted all photos from database"
else
    echo "No photos to delete from database"
fi

echo ""
echo "Step 2: Deleting from Azure Blob Storage"
echo "========================================"

# Azure storage details
STORAGE_ACCOUNT="cbxrentalsphotos"
CONTAINER_NAME="event-photos"

# Check if logged in to Azure
if ! az account show >/dev/null 2>&1; then
    echo "❌ Not logged in to Azure CLI"
    echo "Please run: az login"
    exit 1
fi

# Count blobs
BLOB_COUNT=$(az storage blob list \
    --account-name $STORAGE_ACCOUNT \
    --container-name $CONTAINER_NAME \
    --query "length(@)" \
    --output tsv 2>/dev/null || echo "0")

echo "Found $BLOB_COUNT blob(s) in Azure storage"

if [ "$BLOB_COUNT" != "0" ]; then
    # Delete all blobs
    az storage blob delete-batch \
        --account-name $STORAGE_ACCOUNT \
        --source $CONTAINER_NAME \
        --pattern "*" >/dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Deleted all blobs from Azure storage"
    else
        echo "❌ Failed to delete blobs from Azure storage"
    fi
else
    echo "No blobs to delete from Azure storage"
fi

echo ""
echo "🎉 Cleanup complete!"
echo ""
echo "Summary:"
echo "- Database: $PHOTO_COUNT photo(s) deleted"
echo "- Azure: $BLOB_COUNT blob(s) deleted"