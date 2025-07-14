import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Trash2, Camera, Download, Calendar, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/use-toast';
import { format } from 'date-fns';
import { trackEvent, trackException } from '../../lib/appInsights';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

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

export function PhotosManagement() {
  const { userType } = useAuthStore();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userType === 'admin') {
      loadPhotos();
    }
  }, [userType]);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          attendee:attendees(name)
        `)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
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

  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return;

    setDeleting(true);
    try {
      // Delete from database
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', selectedPhoto.id);

      if (error) throw error;

      // Track deletion
      trackEvent('Admin Photo Deleted', {
        photoId: selectedPhoto.id,
        filename: selectedPhoto.filename,
        uploadedBy: selectedPhoto.attendee?.name || 'Unknown',
      });

      toast({
        title: 'Success',
        description: 'Photo deleted successfully',
      });

      // Reload photos
      await loadPhotos();
      setShowDeleteDialog(false);
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
      trackException(error as Error, {
        context: 'admin_photo_delete',
        photoId: selectedPhoto.id,
      });
      toast({
        title: 'Error',
        description: 'Failed to delete photo',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (photo: Photo) => {
    try {
      // Track download
      trackEvent('Admin Photo Downloaded', {
        photoId: photo.id,
        filename: photo.filename,
      });

      // Open photo in new tab for download
      window.open(photo.url, '_blank');
    } catch (error) {
      console.error('Error downloading photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to download photo',
        variant: 'destructive',
      });
    }
  };

  if (userType !== 'admin') {
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Photos Management</h1>
          <p className="text-gray-600 mt-1">Total photos: {photos.length}</p>
        </div>
      </div>

      {photos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No photos uploaded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Event Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity cursor-pointer"
                      onClick={() => window.open(photo.url, '_blank')}
                    />
                  </div>
                  
                  {/* Photo info on hover */}
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-2 flex flex-col justify-between">
                    <div className="text-white text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate">{photo.attendee?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(photo.uploaded_at), 'MM/dd/yy')}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(photo);
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-white hover:bg-red-600/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhoto(photo);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
              {selectedPhoto && (
                <div className="mt-4 text-sm">
                  <p>Uploaded by: {selectedPhoto.attendee?.name || 'Unknown'}</p>
                  <p>Date: {format(new Date(selectedPhoto.uploaded_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhoto}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}