// src/components/layout/DashboardLayout.tsx
import React from 'react';
import { Box } from '@mui/material';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <Box className="min-h-screen bg-gray-50 flex flex-col">
      {/* 고정 헤더 */}
      <Box className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </Box>
      
      {/* 메인 컨테이너 */}
      <Box className="flex flex-1 pt-16"> {/* pt-16은 헤더 높이만큼 패딩 */}
        {/* 고정 사이드바 */}
        <Box className="fixed left-0 top-16 bottom-0 z-40">
          <Sidebar />
        </Box>
        
        {/* 동적 콘텐츠 영역 (URL에 따라 바뀌는 부분) */}
        <Box className="flex-1 ml-52"> {/* ml-52는 사이드바 너비만큼 마진 */}
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;