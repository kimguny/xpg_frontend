'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Pagination,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useGetNotifications } from '@/hooks/query/useGetNotifications';
import { useDeleteNotification } from '@/hooks/mutation/useDeleteNotification';
import { Notification } from '@/lib/api/admin';

// 상태별 한글 매핑
const STATUS_LABEL: Record<string, string> = {
  draft: '임시저장',
  scheduled: '예약',
  published: '게시중',
  expired: '종료',
  all: '전체',
};

// 유형별 한글 매핑
const TYPE_LABEL: Record<string, string> = {
  system: '시스템 공지',
  event: '이벤트 공지',
  promotion: '프로모션',
};

// 상태별 Chip 색상
const getStatusChip = (status: string) => {
  const colorMap: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
    published: 'success',
    scheduled: 'warning',
    draft: 'default',
    expired: 'error',
  };
  return (
    <Chip 
      label={STATUS_LABEL[status] || status} 
      color={colorMap[status] || 'default'} 
      size="small" 
    />
  );
};

export default function NotificationManagementContent() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  // API 훅
  const { data: notificationsData, isLoading } = useGetNotifications({
    status: currentTab === 'all' ? undefined : (currentTab as 'draft' | 'scheduled' | 'published' | 'expired'),
    page: currentPage,
    size: 20,
  });
  const deleteNotificationMutation = useDeleteNotification();

  // 탭 변경 핸들러
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setCurrentPage(1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // 삭제 핸들러
  const handleDeleteClick = (notificationId: string) => {
    setSelectedNotificationId(notificationId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedNotificationId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedNotificationId) {
      deleteNotificationMutation.mutate(selectedNotificationId);
    }
    handleDialogClose();
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const notifications = notificationsData?.items || [];
  const totalPages = notificationsData ? Math.ceil(notificationsData.total / notificationsData.size) : 1;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        공지사항 관리
      </Typography>

      {/* 상태 탭 */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="전체" value="all" />
          <Tab label="게시중" value="published" />
          <Tab label="예약" value="scheduled" />
          <Tab label="임시저장" value="draft" />
        </Tabs>
      </Box>

      {/* 새로 고침 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/save/notifications/register')}
        >
          새로 고침
        </Button>
      </Box>

      {/* 공지사항 테이블 */}
      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>번호</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>제목</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>유형</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>시작일</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>종료일</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>조회수</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    등록된 공지사항이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((notification: Notification, index: number) => (
                  <TableRow key={notification.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell>{(currentPage - 1) * 20 + index + 1}</TableCell>
                    <TableCell>{notification.title}</TableCell>
                    <TableCell>{TYPE_LABEL[notification.notification_type]}</TableCell>
                    <TableCell>{getStatusChip(notification.status)}</TableCell>
                    <TableCell>{formatDate(notification.start_at)}</TableCell>
                    <TableCell>{formatDate(notification.end_at)}</TableCell>
                    <TableCell>{notification.view_count.toLocaleString()}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => router.push(`/save/notifications/${notification.id}/edit`)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(notification.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        {!isLoading && notifications.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleConfirmDelete}
        title="공지사항 삭제"
        message="정말로 이 공지사항을 삭제하시겠습니까?"
        isPending={deleteNotificationMutation.isPending}
      />
    </Box>
  );
}