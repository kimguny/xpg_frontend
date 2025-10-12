// src/components/layout/index.tsx
'use client';

import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header 영역 */}
      <Box sx={{ flexShrink: 0 }}>
        <Header />
      </Box>
      
      {/* Sidebar + Main Content 영역 */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar 영역 */}
        <Box sx={{ flexShrink: 0, width: 240 }}>
          <Sidebar />
        </Box>
        
        {/* Main Content 영역 */}
        <Box
          component="main"
          sx={{
            flex: 1,
            bgcolor: '#f5f5f5',
            p: 3,
            overflow: 'auto'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}