// src/components/layout/Sidebar.tsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface MenuItem {
  name: string;
  active: boolean;
}

const Sidebar: React.FC = () => {
  const menuItems: MenuItem[] = [
    { name: 'HOME', active: true },
    { name: '콘텐츠', active: false },
    { name: 'NFC', active: false },
    { name: '회원 관리', active: false }
  ];

  return (
    <Box className="bg-gray-100 w-52 min-h-screen flex flex-col p-4">
      {/* Logo Section */}
      <Box className="mb-8 text-center">
        <Box className="w-12 h-12 bg-black mx-auto mb-2 flex items-center justify-center rounded">
          <Typography variant="h6" className="text-white font-bold">
            ✕
          </Typography>
        </Box>
        <Typography variant="body2" className="font-semibold text-gray-800">
          X-Play.G
        </Typography>
      </Box>
      
      {/* Menu Items */}
      <Box className="flex flex-col space-y-2 mb-8">
        {menuItems.map((item, index) => (
          <Button
            key={index}
            fullWidth
            variant={item.active ? "contained" : "text"}
            className={`justify-start text-left py-2 ${
              item.active 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item.name}
          </Button>
        ))}
      </Box>
      
      {/* Refresh Button */}
      <Box className="mt-auto">
        <Button
          variant="outlined"
          fullWidth
          className="border-gray-400 text-gray-700 hover:bg-gray-50"
        >
          새로 고침
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;