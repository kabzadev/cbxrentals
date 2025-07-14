# Azure Storage CORS Configuration

The photo upload feature is getting blocked by CORS. You need to configure CORS on your Azure Storage account.

## Option 1: Azure Portal (Easiest)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your storage account: `cbxrentalsphotos`
3. In the left menu, under "Settings", click on "Resource sharing (CORS)"
4. Click on "Blob service"
5. Add a new CORS rule with these settings:

   - **Allowed origins**: 
     ```
     https://thankful-meadow-0f3320d0f.2.azurestaticapps.net
     https://*.azurestaticapps.net
     http://localhost:5173
     http://localhost:3000
     ```
   - **Allowed methods**: GET, HEAD, POST, PUT, DELETE, OPTIONS
   - **Allowed headers**: *
   - **Exposed headers**: *
   - **Max age**: 3600

6. Click "Save"

## Option 2: Azure CLI

If you have the storage account key or connection string:

```bash
# Get your storage account key
az storage account keys list --account-name cbxrentalsphotos --resource-group <your-resource-group>

# Then run:
az storage cors add \
  --services b \
  --methods GET HEAD POST PUT DELETE OPTIONS \
  --origins "https://thankful-meadow-0f3320d0f.2.azurestaticapps.net" "https://*.azurestaticapps.net" "http://localhost:5173" "http://localhost:3000" \
  --allowed-headers "*" \
  --exposed-headers "*" \
  --max-age 3600 \
  --account-name cbxrentalsphotos \
  --account-key <your-storage-account-key>
```

## Option 3: Azure Storage Explorer

1. Download [Azure Storage Explorer](https://azure.microsoft.com/features/storage-explorer/)
2. Connect to your storage account
3. Right-click on "Blob Containers" → "Configure CORS"
4. Add the same settings as Option 1

After configuring CORS, the photo upload feature should work immediately without needing to redeploy.