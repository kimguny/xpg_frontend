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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  CircularProgress,
} from '@mui/material';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useGetContents } from '@/hooks/query/useGetContents'; 
import { Content, deleteAdminContent, toggleContentStatus } from '@/lib/api/admin';
import { useContentStore } from '@/store/contentStore';

export default function ContentManageList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: contentsData, isLoading } = useGetContents();
  const contents = contentsData?.items ?? [];

  const setContentToClone = useContentStore((state) => state.setContentToClone);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'copy' | 'delete' | null;
    content: Content | null;
  }>({
    open: false,
    type: null,
    content: null,
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteAdminContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContents'] });
      setConfirmDialog({ open: false, type: null, content: null });
    },
    onError: (error) => {
      console.error("삭제 실패:", error);
      alert('삭제에 실패했습니다.');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleContentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContents'] });
    },
    onError: (error) => {
      console.error("상태 변경 실패:", error);
      alert('상태 변경에 실패했습니다.');
    },
  });

  const handleStatusToggle = (id: string) => {
    toggleStatusMutation.mutate(id);
  };
  
  const handleAction = (type: 'edit' | 'copy' | 'delete', content: Content) => {
    if (type === 'edit') {
      router.push(`/save/content/manage/${content.id}/edit`);
    } else if (type === 'delete') {
      setConfirmDialog({ open: true, type: 'delete', content });
    } else if (type === 'copy') {
      setContentToClone(content);
      router.push('/save/content/register');
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.content && confirmDialog.type === 'delete') {
      deleteMutation.mutate(confirmDialog.content.id);
    }
  };

  const handleStageManage = (contentId: string) => {
    router.push(`/save/content/stage/${contentId}`);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>콘텐츠 관리</Typography>
        <Button variant="contained" onClick={() => router.push('/save/content/register')}>
          새 콘텐츠 등록
        </Button>
      </Box>

      <Card sx={{ boxShadow: 1 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>콘텐츠 리스트</Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>콘텐츠 명</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>콘텐츠 유형</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>이벤트 기간</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>스테이지 등록</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>서비스 설정</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
              ) : contents.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">등록된 콘텐츠가 없습니다.</TableCell></TableRow>
              ) : (
                contents.map((content) => (
                  <TableRow key={content.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell>{content.title}</TableCell>
                    <TableCell>{content.content_type}</TableCell>
                    <TableCell>
                      {content.is_always_on 
                        ? '상시' 
                        : `${content.start_at ? new Date(content.start_at).toLocaleDateString() : '미지정'} ~ ${content.end_at ? new Date(content.end_at).toLocaleDateString() : '미지정'}`}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {content.active_stage_count}/{content.stage_count ?? 'N/A'}
                        </Typography>
                        <Button variant="contained" size="small" onClick={() => handleStageManage(content.id)} sx={{ minWidth: 60 }}>
                          관리
                        </Button>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={content.is_open ? '활성' : '비활성'}
                        size="small"
                        color={content.is_open ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{content.is_open ? '활성' : '비활성'}</Typography>
                        <Switch
                          checked={content.is_open}
                          onChange={() => handleStatusToggle(content.id)}
                          size="small"
                          disabled={toggleStatusMutation.isPending}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="text" size="small" onClick={() => handleAction('edit', content)} sx={{ minWidth: 50 }}>
                          수정
                        </Button>
                        <Typography sx={{ color: 'text.secondary' }}>|</Typography>
                        <Button variant="text" size="small" onClick={() => handleAction('copy', content)} sx={{ minWidth: 50 }}>
                          복제
                        </Button>
                        <Typography sx={{ color: 'text.secondary' }}>|</Typography>
                        <Button variant="text" size="small" color="error" onClick={() => handleAction('delete', content)} sx={{ minWidth: 50 }}>
                          삭제
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: null, content: null })}>
        <DialogTitle>콘텐츠 삭제</DialogTitle>
        <DialogContent>
          {/* 2. 큰따옴표 제거하고 템플릿 리터럴로 수정 */}
          <Typography>
            {`'${confirmDialog.content?.title}' 콘텐츠를 정말 삭제하시겠습니까?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: null, content: null })}>취소</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}