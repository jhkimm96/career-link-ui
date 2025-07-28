'use client';

import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <img
        src="/403_image.png"
        alt="logo"
        style={{ height: 300, width: 1300, objectFit: 'contain' }}
      />
      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: '2rem' }}
        onClick={() => router.push('/')}
      >
        홈으로 돌아가기
      </Button>
    </div>
  );
}
