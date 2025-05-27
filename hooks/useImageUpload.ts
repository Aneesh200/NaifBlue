import { extractPathFromUrl } from '@/lib/storage';
import { useState } from 'react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadResult {
    url: string;
    path: string;
}

export function useImageUpload() {
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [uploadedImages, setUploadedImages] = useState<UploadResult[]>([]);

    const uploadImage = async (file: File, folder: string = 'products'): Promise<string | null> => {
        try {
            setStatus('uploading');
            setProgress(0);
            setError(null);

            // Create FormData for the file
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + Math.random() * 15;
                    return newProgress > 95 ? 95 : newProgress;
                });
            }, 300);

            // Use the correct API endpoint
            const response = await fetch('/api/storage', {
                method: 'POST',
                body: formData,
            });

            // Clear progress interval
            clearInterval(progressInterval);

            // Handle response
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }

            // Set final progress and status
            setProgress(100);
            setStatus('success');

            // Add to uploaded images
            setUploadedImages(prev => [...prev, { url: data.url, path: data.path }]);

            return data.url;

        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            return null;
        }
    };

    const uploadMultipleImages = async (files: File[], folder: string = 'products'): Promise<string[]> => {
        try {
            setStatus('uploading');
            setProgress(0);
            setError(null);

            const uploadPromises = Array.from(files).map(async (file, index) => {
                // Update progress as each file uploads
                const fileProgress = (index / files.length) * 100;
                setProgress(fileProgress);

                // Create FormData for the file
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', folder);

                // Upload the file
                const response = await fetch('/api/storage', {
                    method: 'POST',
                    body: formData,
                });

                // Handle response
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to upload image');
                }

                const data = await response.json();
                return data.url;
            });

            // Wait for all uploads to complete
            const results = await Promise.allSettled(uploadPromises);

            // Filter out fulfilled promises and extract URLs
            const successfulUploads = results
                .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
                .map(result => result.value);

            if (successfulUploads.length === 0) {
                throw new Error('No images were uploaded successfully');
            }

            // Set final progress and status
            setProgress(100);
            setStatus('success');

            return successfulUploads;

        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            return [];
        }
    };
    const deleteImage = async (path: string): Promise<boolean> => {
        try {
            const response = await fetch(`/api/storage?path=${encodeURIComponent(path)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete image');
            }

            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            return false;
        }
    }
    const deleteMultipleImages = async (paths: string[]): Promise<boolean[]> => {
        //extract paths 
        if (!Array.isArray(paths) || paths.length === 0) {
            console.error('No paths provided for deletion');
            return [];
        }
        console.log('Paths to delete:', paths);
        // Map over paths and create delete promises
        const extractedPaths: string[] = [];
        paths.map((path) => {
            if (path.startsWith('http')) {
                // If the path is a URL, extract the path from it
                extractedPaths.push(extractPathFromUrl(path)!);
            }
        });
        console.log('Extracted paths:', extractedPaths);

        const deletePromises = extractedPaths.map(async (path) => {
            const res = deleteImage(path);
            return res;
        });
        try {
            const results = await Promise.all(deletePromises);
            return results;
        } catch (error) {
            console.error('Error deleting multiple images:', error);
            return paths.map(() => false); // Return false for each path if any deletion fails
        }
    };

    const reset = () => {
        setStatus('idle');
        setProgress(0);
        setError(null);
        setUploadedImages([]);
    };

    return {
        deleteImage,
        deleteMultipleImages,
        uploadImage,
        uploadMultipleImages,
        status,
        progress,
        error,
        uploadedImages,
        reset
    };
}

