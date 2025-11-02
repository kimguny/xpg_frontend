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
  // Grid, // [1. 삭제] Grid 컴포넌트 삭제
} from '@mui/material';
import { Refresh, Construction } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';

// 대시보드 전용 훅 임포트
import { useGetHomeDashboardData } from '@/hooks/query/useGetHomeDashboardData'; 

interface StatCardProps {
  title: string;
  value: string | React.ReactNode;
  subtitle: string;
  disabled?: boolean;
}

// 통계 카드 컴포넌트
const StatCard = ({ title, value, subtitle, disabled }: StatCardProps) => (
  <Card sx={{ 
    flex: 1, 
    boxShadow: 1, 
    bgcolor: disabled ? 'grey.50' : 'background.paper',
    color: disabled ? 'text.disabled' : 'text.primary',
    height: '100%' // [2. 추가] flexbox 높이 동일하게
  }}>
    <CardContent sx={{ 
      textAlign: 'center', 
      py: 4, 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      height: '100%' 
    }}>
      <Typography variant="h6" sx={{ mb: 2, color: disabled ? 'text.disabled' : 'text.secondary' }}>{title}</Typography>
      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1.5, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {disabled ? <Construction sx={{ fontSize: 40 }} /> : value}
      </Typography>
      <Typography variant="body2" color={disabled ? 'text.disabled' : 'text.secondary'}>{subtitle}</Typography>
    </CardContent>
  </Card>
);

// HOME 대시보드 메인 컴포넌트
export default function DashboardContent() {
  const queryClient = useQueryClient();

  // 대시보드 전용 API 1개를 호출
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError,
  } = useGetHomeDashboardData();


  const handleRefresh = () => {
    // 훅 쿼리 키에 맞춰서 무효화
    queryClient.invalidateQueries({ queryKey: ['homeDashboardData'] });
  };

  // 6개 카드 데이터 정의
  const statCards: StatCardProps[] = [
    {
      title: '전체 회원 수',
      value: isDashboardLoading ? <CircularProgress size={40} /> : `${dashboardData?.users.total ?? 0}명`,
      subtitle: `오늘 ${dashboardData?.users.todaySignups ?? 0}명 / 탈퇴 ${dashboardData?.users.todayWithdrawals ?? 0}명`,
    },
    {
      title: '콘텐츠 등록 수',
      value: isDashboardLoading ? <CircularProgress size={40} /> : `${dashboardData?.contents.activeCount ?? 0} / ${dashboardData?.contents.total ?? 0}개`,
      subtitle: '(활성/전체)',
    },
    {
      title: 'NFC 등록 수',
      value: isDashboardLoading ? <CircularProgress size={40} /> : `${dashboardData?.nfcTags.activeCount ?? 0} / ${dashboardData?.nfcTags.total ?? 0}개`,
      subtitle: '(활성/전체)',
    },
    {
      title: '리워드 지표',
      value: 'N/A',
      subtitle: '(준비 중)',
      disabled: true,
    },
    {
      title: '오류 및 이상 감지',
      value: 'N/A',
      subtitle: '(준비 중)',
      disabled: true,
    },
    {
      title: '프로모션 공지 관리',
      value: 'N/A',
      subtitle: '(준비 중)',
      disabled: true,
    }
  ];
  
  // API 응답에서 진행중인 콘텐츠 목록 가져오기
  const ongoingContents = dashboardData?.ongoingContents ?? [];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>HOME 대시보드</Typography>
        <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={handleRefresh}>
          새로 고침
        </Button>
      </Box>

      {/* [3. 수정] Grid -> Box Flexbox 레이아웃으로 변경 (2x3) */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 3, // theme.spacing(3) == 24px
          mb: 3 
        }}
      >
        {statCards.map((card, index) => (
          <Box 
            key={index}
            sx={{
              // theme.spacing(3) = 24px
              // 3열 (md): calc(33.333% - 16px) -> 16px = (24px * 2 / 3)
              // 2열 (sm): calc(50% - 12px)      -> 12px = (24px / 2)
              // 1열 (xs): 100%
              width: {
                xs: '100%',
                sm: 'calc(50% - 12px)', 
                md: 'calc(33.333% - 16px)'
              }
            }}
          >
            <StatCard 
              title={card.title} 
              value={card.value} 
              subtitle={card.subtitle} 
              disabled={card.disabled}
            />
          </Box>
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
                {isDashboardLoading ? (
                  <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
                ) : isError ? (
                   <TableRow><TableCell colSpan={6} align="center">데이터를 불러오는데 실패했습니다.</TableCell></TableRow>
                ) : ongoingContents.length > 0 ? (
                  ongoingContents.map(content => (
                    <TableRow key={content.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      <TableCell>{content.title}</TableCell>
                      <TableCell><Chip label="진행 중" size="small" color="success" /></TableCell>
                      <TableCell>
                        {content.start_at ? new Date(content.start_at).toLocaleDateString() : '상시'} ~ {content.end_at ? new Date(content.end_at).toLocaleDateString() : ''}
                      </TableCell>
                      {/* 참여인원 데이터 바인딩 */}
                      <TableCell>{content.participant_count ?? 0}</TableCell>
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