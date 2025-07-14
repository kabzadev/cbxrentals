# Azure Blob Storage CORS Configuration

## Issue
The photo upload feature is failing with CORS errors when trying to upload to Azure Blob Storage.

## Solution
You need to configure CORS rules in your Azure Storage Account. Follow these steps:

1. **Go to Azure Portal**
   - Navigate to your Storage Account (cbxrentalsphotos)
   - In the left menu, find "Resource sharing (CORS)" under "Settings"

2. **Add CORS Rules for Blob Service**
   Add the following CORS rule:

   - **Allowed origins**: 
     ```
     https://www.cbxexperience.com
     http://localhost:5173
     http://localhost:5174
     https://thankful-meadow-0f3320d0f.5.azurestaticapps.net
     ```
   
   - **Allowed methods**: 
     ```
     GET, PUT, POST, DELETE, OPTIONS, HEAD
     ```
   
   - **Allowed headers**: 
     ```
     *
     ```
   
   - **Exposed headers**: 
     ```
     *
     ```
   
   - **Max age**: 
     ```
     3600
     ```

3. **Save the Configuration**
   Click "Save" to apply the CORS rules.

## Alternative: Using Azure CLI

```bash
az storage cors add \
  --services b \
  --methods GET PUT POST DELETE OPTIONS HEAD \
  --origins "https://www.cbxexperience.com" "http://localhost:5173" "http://localhost:5174" "https://thankful-meadow-0f3320d0f.5.azurestaticapps.net" \
  --allowed-headers "*" \
  --exposed-headers "*" \
  --max-age 3600 \
  --account-name cbxrentalsphotos
```

## Verification
After configuring CORS, test the photo upload feature again. The CORS errors should be resolved.

## Note
Make sure your SAS token has the appropriate permissions (read, write, create, delete) for the operations you're performing.