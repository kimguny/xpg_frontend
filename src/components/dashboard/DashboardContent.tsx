'use client';

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
  CircularProgress,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { useGetDashboardData } from '@/hooks/query/useGetDashboard'; // ✨ Import the new hook

interface StatCardProps {
  title: string;
  value: string | React.ReactNode;
  subtitle: string;
}

export default function DashboardContent() {
  const queryClient = useQueryClient();

  const {
    usersData,
    isUsersLoading,
    contentsData,
    isContentsLoading,
    nfcTagsData,
    isNfcTagsLoading,
  } = useGetDashboardData();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    queryClient.invalidateQueries({ queryKey: ['adminContents'] });
    queryClient.invalidateQueries({ queryKey: ['adminNfcTags'] });
  };

  const statCards: StatCardProps[] = [
    {
      title: '전체 회원 수',
      value: isUsersLoading ? <CircularProgress size={40} /> : `${usersData?.total ?? 0}명`,
      subtitle: '오늘 00명 / 탈퇴 00명',
    },
    {
      title: '콘텐츠 등록 수',
      value: isContentsLoading ? <CircularProgress size={40} /> : `${contentsData?.items.filter(c => c.is_open).length ?? 0} / ${contentsData?.total ?? 0}개`,
      subtitle: '(활성/전체)',
    },
    {
      title: 'NFC 등록 수',
      value: isNfcTagsLoading ? <CircularProgress size={40} /> : `${nfcTagsData?.total ?? 0}개`,
      subtitle: '(활성/전체)',
    }
  ];
  
  const ongoingContents = contentsData?.items.filter(c => c.is_open) ?? [];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>HOME 대시보드</Typography>
        <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={handleRefresh}>
          새로 고침
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        {statCards.map((card, index) => (
          <Card key={index} sx={{ flex: 1, boxShadow: 1 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>{card.title}</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1.5, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">{card.subtitle}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card sx={{ boxShadow: 1 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              진행중인 콘텐츠 ({ongoingContents.length})
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>콘텐츠 명</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>이벤트 기간</TableCell>
                  <TableCell>참여인원</TableCell>
                  <TableCell>콘텐츠 관리</TableCell>
                  <TableCell>진행 관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isContentsLoading ? (
                  <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
                ) : ongoingContents.length > 0 ? (
                  ongoingContents.map(content => (
                    <TableRow key={content.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      <TableCell>{content.title}</TableCell>
                      <TableCell><Chip label="진행 중" size="small" color="success" /></TableCell>
                      <TableCell>
                        {content.start_at ? new Date(content.start_at).toLocaleDateString() : '상시'} ~ {content.end_at ? new Date(content.end_at).toLocaleDateString() : ''}
                      </TableCell>
                      <TableCell>0</TableCell>
                      <TableCell><Button size="small">메뉴 / 세팅</Button></TableCell>
                      <TableCell><Button size="small">종료 시작 삭제</Button></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">진행중인 콘텐츠가 없습니다.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}