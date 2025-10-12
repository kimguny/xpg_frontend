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
} from '@mui/material';

interface Stage {
  no: number;
  name: string;
  hints: number;
  puzzles: number;
  nfc: number;
  status: 'completed' | 'incomplete' | 'hidden';
  serviceStatus: 'active' | 'inactive';
}

interface StageManageListProps {
  contentId: string;
}

export default function StageManageList({ contentId }: StageManageListProps) {
  const router = useRouter();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'edit' | 'copy' | 'delete' | null;
    stage: Stage | null;
  }>({
    open: false,
    type: null,
    stage: null,
  });

  // 임시 데이터
  const contentName = '목포의 눈물';
  const totalStages = 10;
  
  const [stages, setStages] = useState<Stage[]>([
    {
      no: 1,
      name: '항구의 시작',
      hints: 2,
      puzzles: 1,
      nfc: 3,
      status: 'completed',
      serviceStatus: 'active',
    },
    {
      no: 2,
      name: '미등록',
      hints: 0,
      puzzles: 0,
      nfc: 0,
      status: 'incomplete',
      serviceStatus: 'inactive',
    },
    {
      no: 3,
      name: '히든 스테이지',
      hints: 0,
      puzzles: 0,
      nfc: 0,
      status: 'hidden',
      serviceStatus: 'inactive',
    },
  ]);

  const handleAction = (type: 'edit' | 'copy' | 'delete', stage: Stage) => {
    setConfirmDialog({ open: true, type, stage });
  };

  const handleConfirm = () => {
    const { type, stage } = confirmDialog;
    if (!stage) return;

    switch (type) {
      case 'edit':
        router.push(`/save/content/stage/${contentId}/${stage.no}/edit`);
        break;
      case 'copy':
        console.log('Copy:', stage);
        break;
      case 'delete':
        setStages(stages.filter(s => s.no !== stage.no));
        break;
    }
    setConfirmDialog({ open: false, type: null, stage: null });
  };

  const handleRegister = (stageNo: number) => {
    router.push(`/save/content/stage/${contentId}/${stageNo}/register`);
  };

  const getStatusLabel = (status: Stage['status']) => {
    switch (status) {
      case 'completed':
        return '등록 완료';
      case 'incomplete':
        return '미등록';
      case 'hidden':
        return '히든 스테이지';
    }
  };

  const getStatusColor = (status: Stage['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'incomplete':
        return 'default';
      case 'hidden':
        return 'warning';
    }
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            스테이지 관리
          </Typography>
          <Typography variant="body2" color="text.secondary">
            메인 콘텐츠: {contentName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            스테이지 수: {totalStages}개
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => router.push('/save/content/manage')}
        >
          콘텐츠 관리로 돌아가기
        </Button>
      </Box>

      <Card sx={{ boxShadow: 1 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            스테이지 목록
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>NO</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>스테이지 명</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>힌트 유형</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>퍼즐</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>NFC</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>서비스 상태</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stages.map((stage) => (
                <TableRow key={stage.no} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>{stage.no}</TableCell>
                  <TableCell>{stage.name}</TableCell>
                  <TableCell>
                    {stage.hints > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip label={`힌트${stage.hints}`} size="small" />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {stage.puzzles > 0 ? (
                      <Chip label={`퍼즐${stage.puzzles}`} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>{stage.nfc > 0 ? stage.nfc : '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(stage.status)}
                      size="small"
                      color={getStatusColor(stage.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {stage.serviceStatus === 'active' ? '● 활성' : '○ 비활성'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {stage.status === 'completed' ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleAction('edit', stage)}
                          sx={{ minWidth: 50 }}
                        >
                          수정
                        </Button>
                        <Typography sx={{ color: 'text.secondary' }}>|</Typography>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleAction('copy', stage)}
                          sx={{ minWidth: 50 }}
                        >
                          복제
                        </Button>
                        <Typography sx={{ color: 'text.secondary' }}>|</Typography>
                        <Button
                          variant="text"
                          size="small"
                          color="error"
                          onClick={() => handleAction('delete', stage)}
                          sx={{ minWidth: 50 }}
                        >
                          삭제
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleRegister(stage.no)}
                      >
                        등록
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 확인 다이얼로그 */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: null, stage: null })}>
        <DialogTitle>
          {confirmDialog.type === 'edit' && '스테이지 수정'}
          {confirmDialog.type === 'copy' && '스테이지 복제'}
          {confirmDialog.type === 'delete' && '스테이지 삭제'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            [{confirmDialog.stage?.name}]을(를) 
            {confirmDialog.type === 'edit' && ' 수정'}
            {confirmDialog.type === 'copy' && ' 복제'}
            {confirmDialog.type === 'delete' && ' 삭제'}
            하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: null, stage: null })}>
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