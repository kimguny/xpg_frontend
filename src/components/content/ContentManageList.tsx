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
} from '@mui/material';

interface Content {
  id: number;
  name: string;
  type: '스토리형' | '점령전';
  startDate: string;
  endDate: string;
  stageCount: number;
  completedStages: number;
  status: 'active' | 'inactive';
}

export default function ContentManageList() {
  const router = useRouter();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'edit' | 'copy' | 'delete' | null;
    content: Content | null;
  }>({
    open: false,
    type: null,
    content: null,
  });

  // 임시 데이터
  const [contents, setContents] = useState<Content[]>([
    {
      id: 1,
      name: '목포의 눈물',
      type: '스토리형',
      startDate: '2025/09/11',
      endDate: '2025/09/13',
      stageCount: 10,
      completedStages: 3,
      status: 'active',
    },
  ]);

  const handleStatusToggle = (id: number) => {
    setContents(contents.map(c => 
      c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
    ));
  };

  const handleAction = (type: 'edit' | 'copy' | 'delete', content: Content) => {
    setConfirmDialog({ open: true, type, content });
  };

  const handleConfirm = () => {
    const { type, content } = confirmDialog;
    if (!content) return;

    switch (type) {
      case 'edit':
        console.log('Edit:', content);
        break;
      case 'copy':
        console.log('Copy:', content);
        break;
      case 'delete':
        setContents(contents.filter(c => c.id !== content.id));
        break;
    }
    setConfirmDialog({ open: false, type: null, content: null });
  };

  const handleStageManage = (contentId: number) => {
    router.push(`/save/content/stage/${contentId}`);
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          콘텐츠 관리
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/save/content/register')}
        >
          새 콘텐츠 등록
        </Button>
      </Box>

      <Card sx={{ boxShadow: 1 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            콘텐츠 리스트
          </Typography>
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
              {contents.map((content) => (
                <TableRow key={content.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>{content.name}</TableCell>
                  <TableCell>{content.type}</TableCell>
                  <TableCell>{`${content.startDate}~${content.endDate}`}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {content.completedStages}/{content.stageCount}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleStageManage(content.id)}
                        sx={{ minWidth: 60 }}
                      >
                        관리
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={content.status === 'active' ? '등록 완료' : '미등록'}
                      size="small"
                      color={content.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {content.status === 'active' ? '활성' : '비활성'}
                      </Typography>
                      <Switch
                        checked={content.status === 'active'}
                        onChange={() => handleStatusToggle(content.id)}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleAction('edit', content)}
                        sx={{ minWidth: 50 }}
                      >
                        수정
                      </Button>
                      <Typography sx={{ color: 'text.secondary' }}>|</Typography>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleAction('copy', content)}
                        sx={{ minWidth: 50 }}
                      >
                        복제
                      </Button>
                      <Typography sx={{ color: 'text.secondary' }}>|</Typography>
                      <Button
                        variant="text"
                        size="small"
                        color="error"
                        onClick={() => handleAction('delete', content)}
                        sx={{ minWidth: 50 }}
                      >
                        삭제
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 확인 다이얼로그 */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: null, content: null })}>
        <DialogTitle>
          {confirmDialog.type === 'edit' && '콘텐츠 수정'}
          {confirmDialog.type === 'copy' && '콘텐츠 복제'}
          {confirmDialog.type === 'delete' && '콘텐츠 삭제'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.content?.name}을(를) 
            {confirmDialog.type === 'edit' && ' 수정'}
            {confirmDialog.type === 'copy' && ' 복제'}
            {confirmDialog.type === 'delete' && ' 삭제'}
            하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: null, content: null })}>
            취소
          </Button>
          <Button onClick={handleConfirm} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}