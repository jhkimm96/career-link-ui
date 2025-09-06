import { useState } from 'react';

export type S3UploadType =
  | 'PROFILE_IMAGE'
  | 'COMPANY_LOGO'
  | 'BUSINESS_CERTIFICATE'
  | 'JOB_POSTING';

interface UseS3UploadOptions {
  uploadType: S3UploadType;
}

interface UseS3UploadResult {
  previewUrl: string | null;
  selectedFile: File | null;
  setFile: (file: File) => void;
  getFormData: () => FormData | null;
}

export const useS3Upload = ({ uploadType }: UseS3UploadOptions): UseS3UploadResult => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const setFile = (file: File | null) => {
    setSelectedFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  };

  const getFormData = (): FormData | null => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append('file', selectedFile);
    return formData;
  };

  return { previewUrl, selectedFile, setFile, getFormData };
};
