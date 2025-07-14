#!/bin/bash

# Azure Storage CORS Configuration Script for CBX Rentals Photo Upload

echo "Setting up CORS for Azure Storage Account: cbxrentalsphotos"

# Run the Azure CLI command to configure CORS
az storage cors add \
  --services b \
  --methods GET PUT POST DELETE OPTIONS HEAD \
  --origins "https://www.cbxexperience.com" "http://localhost:5173" "http://localhost:5174" "https://thankful-meadow-0f3320d0f.5.azurestaticapps.net" \
  --allowed-headers "*" \
  --exposed-headers "*" \
  --max-age 3600 \
  --account-name cbxrentalsphotos

if [ $? -eq 0 ]; then
    echo "✅ CORS configuration applied successfully!"
    echo ""
    echo "Verifying CORS settings..."
    az storage cors list --services b --account-name cbxrentalsphotos
else
    echo "❌ Failed to apply CORS configuration."
    echo "Please ensure you are logged in to Azure CLI and have the necessary permissions."
    echo ""
    echo "To login to Azure CLI, run:"
    echo "az login"
fi