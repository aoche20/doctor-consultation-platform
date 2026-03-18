'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { CameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { userApi } from '@/app/lib/api/userApi';

interface ProfileImageUploadProps {
  currentImage?: string;
  userName: string;
  onUploadSuccess: (imageUrl: string) => void;
}

export default function ProfileImageUpload({ currentImage, userName, onUploadSuccess }: ProfileImageUploadProps) {
  const [image, setImage] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const result = await userApi.uploadProfilePhoto(file);
      if (result.success && result.profilePicture) {
        onUploadSuccess(result.profilePicture);
        toast.success('Photo de profil mise à jour');
      } else {
        toast.error(result.message || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
        {image ? (
          <Image
            src={image}
            alt={userName}
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-4xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
      >
        <CameraIcon className="w-5 h-5" />
      </button>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}