'use client';

import { Fab } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useEffect, useState } from 'react';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200); // 200px 이상일 때만 보이게
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <Fab
      color="primary"
      size="small"
      onClick={handleClick}
      sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
    >
      <KeyboardArrowUpIcon />
    </Fab>
  );
}
