import { trackEvent, trackException, trackMetric } from './appInsights';

const STORAGE_URL = import.meta.env.VITE_AZURE_STORAGE_SAS_URL;

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadPhotoToAzure = async (
  file: File,
  attendeeName: string
): Promise<UploadResult> => {
  const startTime = Date.now();
  
  try {
    // Check if storage URL is configured
    console.log('Azure Storage URL value:', STORAGE_URL);
    console.log('Type of STORAGE_URL:', typeof STORAGE_URL);
    console.log('STORAGE_URL length:', STORAGE_URL?.length);
    
    if (!STORAGE_URL || STORAGE_URL === 'undefined' || STORAGE_URL.length === 0) {
      console.log('Azure Storage URL not found. Env vars:', Object.keys(import.meta.env));
      console.log('Raw env value:', import.meta.env.VITE_AZURE_STORAGE_SAS_URL);
      throw new Error('Azure Storage is not configured. Please check your environment variables.');
    }
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    // Max size 10MB
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }
    
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedName = attendeeName.replace(/[^a-zA-Z0-9]/g, '_');
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${sanitizedName}_${timestamp}.${extension}`;
    
    // Parse the storage URL
    const urlParts = STORAGE_URL.split('?');
    if (urlParts.length !== 2) {
      throw new Error('Invalid Azure Storage SAS URL format');
    }
    
    const baseUrl = urlParts[0];
    const sasToken = urlParts[1];
    
    // Upload to Azure Blob Storage
    const response = await fetch(`${baseUrl}/${filename}?${sasToken}`, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': file.type,
      },
      body: file,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const photoUrl = `${baseUrl}/${filename}`;
    
    // Track successful upload
    const uploadTime = Date.now() - startTime;
    trackEvent('Photo Uploaded', {
      attendee: attendeeName,
      filename,
      size: file.size,
      type: file.type,
      duration: uploadTime
    });
    trackMetric('Photo Upload Time', uploadTime);
    trackMetric('Photo Size', file.size);
    
    return {
      success: true,
      url: photoUrl
    };
    
  } catch (error) {
    trackException(error as Error, {
      context: 'photo_upload',
      attendee: attendeeName,
      fileSize: file.size,
      fileType: file.type
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

export const listPhotos = async (): Promise<string[]> => {
  try {
    // For now, we'll need to track uploaded photos in Supabase
    // Azure Blob Storage doesn't support listing without additional setup
    // This is a placeholder for future implementation
    return [];
  } catch (error) {
    trackException(error as Error, { context: 'list_photos' });
    return [];
  }
};