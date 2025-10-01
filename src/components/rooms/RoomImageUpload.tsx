import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { getImageUrl, getApiUrl } from '../../config/api';

interface RoomImageUploadProps {
  roomId: number;
  existingImages?: string[];
  onImagesUpdated: (images: string[]) => void;
  maxImages?: number;
}

interface UploadedImage {
  file: File;
  preview: string;
  uploaded?: boolean;
  url?: string;
}

const RoomImageUpload: React.FC<RoomImageUploadProps> = ({
  roomId,
  existingImages = [],
  onImagesUpdated,
  maxImages = 3
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newImages: UploadedImage[] = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploaded: false
    }));

    setImages(prev => [...prev, ...newImages]);
    setUploadError('');
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].preview);
      return newImages;
    });
  };

  const uploadImages = async () => {
    if (images.length === 0) return;

    setIsUploading(true);
    setUploadError('');

    try {
      // Get all files that need to be uploaded
      const filesToUpload = images.filter(img => !img.uploaded);
      
      if (filesToUpload.length === 0) {
        setIsUploading(false);
        return;
      }

      // Create FormData with the correct structure for RoomImageUploadDto
      const formData = new FormData();
      
      // Add RoomId
      formData.append('RoomId', roomId.toString());
      
      // Add all images to the Images array
      filesToUpload.forEach((imageData, index) => {
        formData.append('Images', imageData.file);
      });

      console.log('Uploading files for room:', roomId);
      console.log('Number of files:', filesToUpload.length);
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch(getApiUrl('RoomImage/upload'), {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);
      
      // Update all uploaded images
      const updatedImages = images.map((imageData, index) => {
        if (!imageData.uploaded && filesToUpload.includes(imageData)) {
          return {
            ...imageData,
            uploaded: true,
            url: result.data?.[index]?.url || result.data?.[index] || result[index]?.url || result[index]
          };
        }
        return imageData;
      });
      
      setImages(updatedImages);

      // Extract URLs for callback
      const imageUrls = updatedImages
        .map(img => img.url)
        .filter(Boolean) as string[];

      onImagesUpdated([...existingImages, ...imageUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <ImageIcon className="w-4 h-4 inline mr-2" />
          Room Images (Max {maxImages})
        </label>
        {images.length > 0 && (
          <button
            type="button"
            onClick={uploadImages}
            disabled={isUploading}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload Images'}
          </button>
        )}
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Existing Images:</p>
          <div className="grid grid-cols-3 gap-2">
            {existingImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={getImageUrl(imageUrl)}
                  alt={`Room ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                  onError={(e) => {
                    console.error('Failed to load image:', imageUrl);
                    e.currentTarget.src = '/placeholder-image.png'; // Fallback image
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = existingImages.filter((_, i) => i !== index);
                    onImagesUpdated(newImages);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onClick={openFileDialog}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer transition-colors"
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Click to upload images or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF up to 10MB each
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Selected Images Preview */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Selected Images:</p>
          <div className="grid grid-cols-3 gap-2">
            {images.map((imageData, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageData.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                {imageData.uploaded && (
                  <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-blue-600">Uploading images...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomImageUpload;
