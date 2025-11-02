// src/components/layout/Header.tsx
'use client';

import { Box, Typography, IconButton, Button } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <Box 
      className="bg-white border-b border-gray-200 px-6 py-3 flex justify-end items-center"
      sx={{ zIndex: 1200, position: 'sticky' , top: 0, bgcolor: '#ffffffff'}}
    >
      <Box className="flex items-center space-x-4">
        <Typography variant="body2" className="text-gray-600">
          xpg_admin@gmail.com
        </Typography>
        <IconButton size="small" onClick={handleLogout}>
          <Settings />
        </IconButton>
        <Button 
          variant="outlined" 
          size="small"
          onClick={handleLogout}
          sx={{
            bgcolor: 'white',
            '&:hover': {
              bgcolor: '#f0f7ff'
            }
          }}
          className="text-blue-600 border-blue-600"
        >
          로그아웃
        </Button>
      </Box>
    </Box>
  );
}