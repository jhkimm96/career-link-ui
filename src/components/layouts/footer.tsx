'use client';

import { Box, Typography, Stack, Link } from '@mui/material';

export default function Footer() {
  return (
    <>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          textAlign: 'center',
          borderTop: '1px solid #ddd',
          backgroundColor: '#f9f9f9',
          mt: 4,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © 2025 Career-Link. All rights reserved.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Built by 김지희 & 박하윤
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Contact:
          <Link href="mailto:jhkimm96@gmail.com" underline="hover" sx={{ ml: 0.5 }}>
            jhkimm96@gmail.com
          </Link>
          /
          <Link href="mailto:hayun.dev00@gmail.com" underline="hover" sx={{ ml: 0.5 }}>
            hayun.dev00@gmail.com
          </Link>
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
          <Link href="#" underline="hover" color="text.secondary">
            이용약관 (준비중)
          </Link>
          <Link href="#" underline="hover" color="text.secondary">
            개인정보처리방침 (준비중)
          </Link>
          <Link
            href="https://github.com/hha6571/career-link"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="text.secondary"
          >
            백엔드 GitHub
          </Link>
          <Link
            href="https://github.com/jhkimm96/career-link-ui"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="text.secondary"
          >
            프론트 GitHub
          </Link>
        </Stack>
      </Box>
    </>
  );
}
