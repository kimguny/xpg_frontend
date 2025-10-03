// src/components/dashboard/DashboardContent.tsx
'use client';

import { useRouter } from 'next/navigation';
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
import { Menu as MenuIcon, Refresh } from '@mui/icons-material';

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

export default function DashboardContent() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

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
    <Box>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{
            bgcolor: 'error.main',
            color: 'white',
            borderRadius: '50%',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            mr: 1.5
          }}>
            1
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            HOME 대시보드
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          sx={{ 
            textTransform: 'none',
            bgcolor: 'white',
            '&:hover': {
              bgcolor: 'grey.50'
            }
          }}
        >
          새로 고침
        </Button>
      </Box>

      {/* 통계 카드 섹션 */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        {statCards.map((card, index) => (
          <Card key={index} sx={{ flex: 1, boxShadow: 1 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                {card.title}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1.5 }}>
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
      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
        {actionCards.map((card, index) => (
          <Card 
            key={index} 
            sx={{ 
              flex: 1,
              boxShadow: 1,
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 },
              transition: 'box-shadow 0.3s'
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ 
                bgcolor: 'error.main', 
                color: 'white', 
                borderRadius: '50%', 
                width: 32, 
                height: 32, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: '0.875rem'
              }}>
                {card.number}
              </Box>
              <Typography variant="h6">{card.title}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* 진행중인 콘텐츠 테이블 */}
      <Card sx={{ boxShadow: 1 }}>
        <CardContent sx={{ p: 0 }}>
          {/* 테이블 헤더 */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              진행중인 콘텐츠(01)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                bgcolor: 'error.main',
                color: 'white',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                mr: 1.5
              }}>
                4
              </Box>
              <Button 
                variant="text" 
                startIcon={<MenuIcon />}
                sx={{ textTransform: 'none' }}
              >
                최신 등록순
              </Button>
            </Box>
          </Box>
          
          {/* 테이블 */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>콘텐츠 명</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>이벤트 기간</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>참여인원</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>콘텐츠 관리</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>진행 관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>목포의 눈물</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        bgcolor: 'success.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        mr: 1.5
                      }}>
                        5
                      </Box>
                      <Chip 
                        label="진행 중" 
                        size="small"
                        sx={{ 
                          bgcolor: 'success.light',
                          color: 'success.dark'
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>2025/09/11~2025/09/13</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        bgcolor: 'error.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        mr: 1.5
                      }}>
                        6
                      </Box>
                      30
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        bgcolor: 'error.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        mr: 1.5
                      }}>
                        2
                      </Box>
                      <Button 
                        variant="text" 
                        size="small" 
                        sx={{ 
                          textTransform: 'none',
                          color: 'primary.main'
                        }}
                      >
                        메뉴 / 세팅
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        bgcolor: 'error.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        mr: 1.5
                      }}>
                        3
                      </Box>
                      <Button 
                        variant="text" 
                        size="small" 
                        sx={{ 
                          textTransform: 'none',
                          color: 'success.main'
                        }}
                      >
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
}