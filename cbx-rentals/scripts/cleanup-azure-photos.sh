#!/bin/bash

# Azure Storage Photo Cleanup Script
# This script deletes all photos from the Azure Blob Storage container

STORAGE_ACCOUNT="cbxrentalsphotos"
CONTAINER_NAME="event-photos"

echo "⚠️  WARNING: This script will DELETE ALL photos from Azure Blob Storage!"
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Container: $CONTAINER_NAME"
echo ""
read -p "Are you sure you want to continue? Type 'YES' to confirm: " confirmation

if [ "$confirmation" != "YES" ]; then
    echo "Operation cancelled."
    exit 1
fi

echo ""
echo "Listing all blobs in the container..."
echo "======================================"

# List all blobs first
blob_count=$(az storage blob list \
    --account-name $STORAGE_ACCOUNT \
    --container-name $CONTAINER_NAME \
    --query "length(@)" \
    --output tsv 2>/dev/null)

if [ -z "$blob_count" ] || [ "$blob_count" -eq 0 ]; then
    echo "No blobs found in the container."
    exit 0
fi

echo "Found $blob_count blob(s) to delete."
echo ""

# Show the blobs that will be deleted
az storage blob list \
    --account-name $STORAGE_ACCOUNT \
    --container-name $CONTAINER_NAME \
    --query "[].{name:name, size:properties.contentLength, lastModified:properties.lastModified}" \
    --output table

echo ""
read -p "Do you want to delete all these blobs? Type 'DELETE' to confirm: " delete_confirmation

if [ "$delete_confirmation" != "DELETE" ]; then
    echo "Operation cancelled."
    exit 1
fi

echo ""
echo "Deleting all blobs..."
echo "===================="

# Delete all blobs in the container
az storage blob delete-batch \
    --account-name $STORAGE_ACCOUNT \
    --source $CONTAINER_NAME \
    --pattern "*"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All blobs have been deleted successfully!"
    
    # Verify deletion
    remaining=$(az storage blob list \
        --account-name $STORAGE_ACCOUNT \
        --container-name $CONTAINER_NAME \
        --query "length(@)" \
        --output tsv 2>/dev/null)
    
    echo "Remaining blobs: ${remaining:-0}"
else
    echo ""
    echo "❌ Failed to delete blobs. Please check your Azure CLI authentication and permissions."
    echo ""
    echo "To login to Azure CLI, run:"
    echo "az login"
fi