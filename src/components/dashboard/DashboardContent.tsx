// src/components/dashboard/DashboardContent.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  subtitleColor: string;
}

interface ActionCard {
  number: number;
  title: string;
}

const DashboardContent: React.FC = () => {
  const statCards: StatCard[] = [
    {
      title: '전체 회원 수',
      value: '000명',
      subtitle: '오늘 00명 / 탈퇴 00명',
      subtitleColor: 'text-blue-600'
    },
    {
      title: '콘텐츠 등록 수',
      value: '0/0개',
      subtitle: '(활성/전체)',
      subtitleColor: 'text-gray-600'
    },
    {
      title: 'NFC 등록 수',
      value: '00/00개',
      subtitle: '(활성/전체)',
      subtitleColor: 'text-gray-600'
    }
  ];

  const actionCards: ActionCard[] = [
    { number: 7, title: '리워드 지급' },
    { number: 8, title: '오류 및 이상 감지' },
    { number: 9, title: '프로모션 공지 관리' }
  ];

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      {/* 헤더 섹션 */}
      <Box className="mb-6 flex items-center">
        <Box className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
          1
        </Box>
        <Typography variant="h5" className="font-bold text-gray-800">
          HOME 대시보드
        </Typography>
      </Box>

      {/* 통계 카드 섹션 */}
      <Box className="flex flex-wrap gap-6 mb-6">
        {statCards.map((card, index) => (
          <Card key={index} className="flex-1 min-w-80 shadow-sm">
            <CardContent className="text-center p-6">
              <Typography variant="h6" className="mb-4 text-gray-700">
                {card.title}
              </Typography>
              <Typography variant="h3" className="font-bold mb-3 text-gray-900">
                {card.value}
              </Typography>
              <Typography variant="body2" className={card.subtitleColor}>
                {card.subtitle}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* 액션 카드 섹션 */}
      <Box className="flex flex-wrap gap-6 mb-8">
        {actionCards.map((card, index) => (
          <Card 
            key={index} 
            className="flex-1 min-w-80 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="text-center p-6">
              <Box className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mx-auto mb-4">
                {card.number}
              </Box>
              <Typography variant="h6" className="text-gray-700">
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* 진행중인 콘텐츠 테이블 */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {/* 테이블 헤더 */}
          <Box className="p-4 border-b border-gray-200 flex justify-between items-center">
            <Typography variant="h6" className="font-bold text-gray-800">
              진행중인 콘텐츠(01)
            </Typography>
            <Box className="flex items-center">
              <Box className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                4
              </Box>
              <Button 
                variant="text" 
                className="text-gray-600"
                startIcon={<MenuIcon />}
              >
                최신 등록순
              </Button>
            </Box>
          </Box>
          
          {/* 테이블 */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold">콘텐츠 명</TableCell>
                  <TableCell className="font-semibold">상태</TableCell>
                  <TableCell className="font-semibold">이벤트 기간</TableCell>
                  <TableCell className="font-semibold">참여인원</TableCell>
                  <TableCell className="font-semibold">콘텐츠 관리</TableCell>
                  <TableCell className="font-semibold">진행 관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow className="hover:bg-gray-50">
                  <TableCell>목포의 눈물</TableCell>
                  <TableCell>
                    <Box className="flex items-center">
                      <Box className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                        5
                      </Box>
                      <Chip 
                        label="진행 중" 
                        size="small"
                        className="bg-green-100 text-green-800"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>2025/09/11~2025/09/13</TableCell>
                  <TableCell>
                    <Box className="flex items-center">
                      <Box className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                        6
                      </Box>
                      30
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box className="flex items-center">
                      <Box className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                        2
                      </Box>
                      <Button variant="text" size="small" className="text-blue-600">
                        메뉴 / 세팅
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box className="flex items-center">
                      <Box className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                        3
                      </Box>
                      <Button variant="text" size="small" className="text-green-600">
                        종료 시작 삭제
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardContent;