import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
    images: string[];
    onChange: (images: string[]) => void;
    onFilesChange?: (files: File[]) => void;  // New prop for handling files
    pendingFiles?: File[];  // New prop for already selected files
    maxFiles?: number;
    acceptedFileTypes?: string;
    className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    images,
    onChange,
    onFilesChange,
    pendingFiles = [],
    maxFiles = 5,
    acceptedFileTypes = 'image/jpeg, image/png, image/webp',
    className = '',
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // Create preview URLs for pending files
    React.useEffect(() => {
        // Cleanup old preview URLs to prevent memory leaks
        const oldPreviews = [...previewUrls];

        // Generate new preview URLs for pending files
        const newPreviews = pendingFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviews);

        // Cleanup function to revoke object URLs
        return () => {
            oldPreviews.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [pendingFiles]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        handleSelectedFiles(files);
    };

    const handleSelectedFiles = (files: FileList) => {
        // Convert FileList to array and limit to maxFiles
        const fileArray = Array.from(files).slice(0, maxFiles);

        // Validate file types and size
        const validFiles = fileArray.filter(file => {
            // Check file type
            const isValidType = acceptedFileTypes.includes(file.type);

            // Check file size (5MB max)
            const isValidSize = file.size <= 5 * 1024 * 1024;

            if (!isValidType) {
                toast.error(`Invalid file type: ${file.name}`);
            }

            if (!isValidSize) {
                toast.error(`File too large: ${file.name}`);
            }

            return isValidType && isValidSize;
        });

        if (validFiles.length === 0) {
            toast.error('Please select valid image files (JPG, PNG, WebP) under 5MB');
            return;
        }

        // Notify parent component about selected files
        if (onFilesChange) {
            onFilesChange([...pendingFiles, ...validFiles]);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        toast.success(`${validFiles.length} image${validFiles.length > 1 ? 's' : ''} added`);
    };

    // Add image URL manually
    const addImageUrl = () => {
        if (imageUrl && !images.includes(imageUrl)) {
            onChange([...images, imageUrl]);
            setImageUrl('');
            toast.success('Image URL added');
        } else if (images.includes(imageUrl)) {
            toast.error('This image URL is already in the list');
        }
    };

    // Remove image
    const removeImage = async (index: number) => {
        // If it's a server image, just remove it from the array
        if (index < images.length) {
            const updatedImages = [...images];
            updatedImages.splice(index, 1);
            onChange(updatedImages);
            toast.success('Image removed');
            return;
        }

        // If it's a pending file, calculate the correct index and remove it
        const fileIndex = index - images.length;
        if (fileIndex >= 0 && fileIndex < pendingFiles.length) {
            const updatedFiles = [...pendingFiles];
            updatedFiles.splice(fileIndex, 1);

            if (onFilesChange) {
                onFilesChange(updatedFiles);
            }

            toast.success('Pending image removed');
        }
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleSelectedFiles(e.dataTransfer.files);
        }
    };

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Combine stored images and pending file previews
    const allImages = [...images, ...previewUrls];

    return (
        <div className={className}>
            {/* Drag & Drop Upload Area */}
            <div
                className={`flex flex-col items-center justify-center px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedFileTypes}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <>
                    <div className="p-3 rounded-full bg-blue-50 text-blue-500 mb-3">
                        <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-gray-700 font-medium">Drag and drop files here</p>
                    <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                    <p className="text-xs text-gray-400 mt-3">
                        Maximum {maxFiles} files • JPG, PNG, WEBP • 5MB per file
                    </p>
                    {pendingFiles.length > 0 && (
                        <div className="mt-3 text-sm text-blue-600 font-medium">
                            {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''} selected (will upload on save)
                        </div>
                    )}
                </>
            </div>

            {/* Manual URL Input */}
            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Or Add Image URL</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        placeholder="https://example.com/image.jpg"
                    />
                    <button
                        type="button"
                        onClick={addImageUrl}
                        disabled={!imageUrl}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">Enter a valid URL for an image hosted elsewhere</p>
            </div>

            {/* Image Preview - Show both uploaded images and pending files */}
            {allImages.length > 0 ? (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Product Images ({allImages.length})</h3>
                        <div className="flex space-x-2">
                            <span className="text-xs text-gray-500">First image will be featured</span>
                            {pendingFiles.length > 0 && (
                                <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                    {pendingFiles.length} pending upload
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {allImages.map((image, index) => {
                            const isPending = index >= images.length;
                            return (
                                <div key={index} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white">
                                    <div className="aspect-square bg-gray-100 relative">
                                        <img
                                            src={image}
                                            alt={`Product image ${index + 1}`}
                                            className="w-full h-full object-cover absolute inset-0"
                                            style={{ backgroundColor: '#f3f4f6' }}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null; // Prevent infinite error loops
                                                target.style.display = 'none';

                                                const parentDiv = target.parentElement;
                                                if (parentDiv) {
                                                    const placeholderDiv = document.createElement('div');
                                                    placeholderDiv.className = 'absolute inset-0 flex items-center justify-center bg-gray-200';

                                                    placeholderDiv.innerHTML = `
                                                        <div class="flex flex-col items-center justify-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span class="text-xs text-gray-500 mt-1">Image error</span>
                                                        </div>
                                                    `;

                                                    parentDiv.appendChild(placeholderDiv);
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>

                                    {/* Badge for pending files */}
                                    {isPending && (
                                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-md font-medium">
                                            Pending
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-500 hover:text-white"
                                        title="Remove image"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                    {index === 0 && (
                                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-md font-medium opacity-80">
                                            Featured
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="mt-6 border border-gray-200 rounded-lg bg-gray-50 p-6 text-center">
                    <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No images added yet</p>
                    <p className="text-gray-400 text-sm mt-1">Images help your product sell better</p>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
