import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Camera, Upload, ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { uploadPhotoToAzure } from '../lib/azureStorage';
import { useToast } from '../components/ui/use-toast';
import { format } from 'date-fns';
import { trackEvent, trackException } from '../lib/appInsights';

interface Photo {
  id: string;
  url: string;
  filename: string;
  caption?: string;
  uploaded_at: string;
  attendee?: {
    name: string;
  };
}

export function PhotosPage() {
  const { username, attendeeData } = useAuthStore();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [tableExists, setTableExists] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const carouselInterval = useRef<NodeJS.Timeout>();

  // Check if user is Keith Kabza
  const isKeith = username === 'Keith Kabza' || attendeeData?.name === 'Keith Kabza';

  useEffect(() => {
    if (isKeith) {
      loadPhotos();
    }
  }, [isKeith]);

  useEffect(() => {
    // Auto-advance carousel
    if (photos.length > 1) {
      carouselInterval.current = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % photos.length);
      }, 5000); // Change photo every 5 seconds

      return () => {
        if (carouselInterval.current) {
          clearInterval(carouselInterval.current);
        }
      };
    }
  }, [photos.length]);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*, attendee_id')
        .order('uploaded_at', { ascending: false });

      if (error) {
        // Check if the error is because the table doesn't exist
        if (error.code === 'PGRST200' || error.message?.includes('relationship') || error.code === '42P01') {
          console.log('Photos table may not exist yet. Please run the migration.');
          setTableExists(false);
          setPhotos([]);
          setLoading(false);
          return;
        }
        throw error;
      }
      
      // If we have data, manually join with attendees
      if (data && data.length > 0) {
        const attendeeIds = [...new Set(data.map(photo => photo.attendee_id).filter(Boolean))];
        
        if (attendeeIds.length > 0) {
          const { data: attendees } = await supabase
            .from('attendees')
            .select('id, name')
            .in('id', attendeeIds);
          
          const attendeeMap = new Map(attendees?.map(a => [a.id, a]) || []);
          
          const photosWithAttendees = data.map(photo => ({
            ...photo,
            attendee: photo.attendee_id ? attendeeMap.get(photo.attendee_id) : null
          }));
          
          setPhotos(photosWithAttendees);
        } else {
          setPhotos(data);
        }
      } else {
        setPhotos([]);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load photos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    let uploadResult: any = null;
    
    try {
      // Upload to Azure
      uploadResult = await uploadPhotoToAzure(file, attendeeData?.name || username || 'Unknown');

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          url: uploadResult.url,
          filename: file.name,
          attendee_id: attendeeData?.id || null,
        });

      if (dbError) throw dbError;

      // Track upload
      trackEvent('Photo Uploaded', {
        filename: file.name,
        size: file.size,
        uploader: attendeeData?.name || username,
      });

      toast({
        title: 'Success',
        description: 'Photo uploaded successfully!',
      });

      // Reload photos
      await loadPhotos();
    } catch (error) {
      console.error('Upload error:', error);
      trackException(error as Error, {
        context: 'photo_upload',
        uploader: attendeeData?.name || username,
      });
      
      const errorMessage = uploadResult?.error || 
                          (error instanceof Error ? error.message : 'Failed to upload photo');
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Clear both file inputs
      const cameraInput = document.getElementById('camera-input') as HTMLInputElement;
      const galleryInput = document.getElementById('gallery-input') as HTMLInputElement;
      if (cameraInput) cameraInput.value = '';
      if (galleryInput) galleryInput.value = '';
    }
  };

  const groupPhotosByDay = () => {
    const groups: Record<string, Photo[]> = {};
    photos.forEach(photo => {
      const date = format(new Date(photo.uploaded_at), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(photo);
    });
    return groups;
  };

  const handlePrevious = () => {
    setCarouselIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = () => {
    setCarouselIndex((prev) => (prev + 1) % photos.length);
  };

  if (!isKeith) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">You don't have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Loading photos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const photosByDay = groupPhotosByDay();

  return (
    <div className="p-6 space-y-6">
      {/* Header with Upload Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Event Photos</h1>
        {tableExists && (
          <div className="flex gap-2">
            {/* Camera input - for taking photos */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              id="camera-input"
            />
            {/* Gallery input - for selecting existing photos */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="gallery-input"
            />
            <Button
              onClick={() => document.getElementById('camera-input')?.click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            <Button
              onClick={() => document.getElementById('gallery-input')?.click()}
              disabled={uploading}
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Photo
            </Button>
          </div>
        )}
      </div>
      
      {!tableExists && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <p className="text-yellow-800 font-medium mb-2">Photos feature setup required</p>
            <p className="text-yellow-700 text-sm">
              The photos table needs to be created in your database. Please run the SQL migration 
              found in <code className="bg-yellow-100 px-1 py-0.5 rounded text-xs">create_photos_table.sql</code> in your Supabase SQL Editor.
            </p>
          </CardContent>
        </Card>
      )}

      {tableExists && photos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No photos yet. Be the first to share a moment!</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => document.getElementById('camera-input')?.click()}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button
                onClick={() => document.getElementById('gallery-input')?.click()}
                disabled={uploading}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Photo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : tableExists && (
        <>
          {/* Photo Carousel */}
          <Card className="overflow-hidden">
            <CardContent className="p-0 relative">
              <div className="relative h-[500px] bg-black">
                <img
                  src={photos[carouselIndex]?.url}
                  alt={photos[carouselIndex]?.filename}
                  className="w-full h-full object-contain"
                />
                
                {/* Navigation arrows */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Photo info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-sm">
                    Uploaded by {photos[carouselIndex]?.attendee?.name || 'Unknown'} • {' '}
                    {format(new Date(photos[carouselIndex]?.uploaded_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>

                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCarouselIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === carouselIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos by Day */}
          <div className="space-y-6">
            {Object.entries(photosByDay)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([date, dayPhotos]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="w-5 h-5" />
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                      <span className="text-sm font-normal text-gray-500">
                        ({dayPhotos.length} photos)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {dayPhotos.map((photo) => (
                        <button
                          key={photo.id}
                          onClick={() => setSelectedPhoto(photo)}
                          className="relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={photo.url}
                            alt={photo.filename}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </>
      )}

      {/* Full size photo modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.filename}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-sm">
                Uploaded by {selectedPhoto.attendee?.name || 'Unknown'} • {' '}
                {format(new Date(selectedPhoto.uploaded_at), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}