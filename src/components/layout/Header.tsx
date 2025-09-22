// src/components/layout/Header.tsx
import React from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { Settings, Menu } from '@mui/icons-material';

const Header: React.FC = () => {
  return (
    <Box className="bg-white border-b border-gray-200 px-6 py-3 flex justify-end items-center">
      <Box className="flex items-center space-x-4">
        <Typography variant="body2" className="text-gray-600">
          xpg_admin@gmail.com
        </Typography>
        <IconButton size="small">
          <Settings />
        </IconButton>
        <Button 
          variant="outlined" 
          size="small"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          로그아웃
        </Button>
      </Box>
    </Box>
  );
};

export default Header;