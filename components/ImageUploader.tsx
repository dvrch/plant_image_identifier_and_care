
import React, { useRef } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  imagePreviewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, imagePreviewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onImageChange(file);
  };

  return (
    <div
      className="w-full max-w-sm h-72 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-all duration-300 overflow-hidden group bg-white"
      onClick={handleAreaClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg"
      />
      {imagePreviewUrl ? (
        <img src={imagePreviewUrl} alt="Plant preview" className="w-full h-full object-cover" />
      ) : (
        <div className="text-gray-500 flex flex-col items-center p-4">
          <UploadIcon className="w-12 h-12 mb-2 text-gray-400 group-hover:text-green-500 transition-colors" />
          <span className="font-semibold">Click to upload a photo</span>
          <span className="text-sm">or drag and drop (PNG, JPG)</span>
        </div>
      )}
    </div>
  );
};
