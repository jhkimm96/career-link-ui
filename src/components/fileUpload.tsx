'use client';

import React, { ChangeEvent, useRef } from 'react';
import { Box, Button, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface FileUploadProps {
  previewUrl?: string;
  accept?: string;
  onFileChange: (file: File | null) => void;
  fileName?: string | null;
  label?: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  previewUrl,
  accept,
  onFileChange,
  fileName,
  label,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    onFileChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="start" gap={1}>
      <Box display="flex" gap={1} alignItems="center" width="100%">
        <TextField
          variant="outlined"
          label={label ?? ''}
          value={fileName ?? ''}
          disabled
          size="small"
          sx={{ maxWidth: '250px' }}
        />

        <Button variant="outlined" component="label" sx={{ whiteSpace: 'nowrap' }}>
          파일 선택
          <input
            type="file"
            hidden
            accept={accept}
            ref={fileInputRef}
            onChange={handleFileInputChange}
          />
        </Button>
      </Box>

      {previewUrl && (
        <Box position="relative" mt={1}>
          <Box
            component="img"
            src={previewUrl}
            alt="미리보기"
            sx={{
              maxWidth: 200,
              maxHeight: 200,
              borderRadius: 1,
              border: '1px solid',
              objectFit: 'contain',
            }}
          />
          <IconButton
            onClick={handleClear}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'error.main', color: 'white' },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
