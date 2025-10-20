// src/components/events/EventManagementContent.tsx
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
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add, FileCopy } from '@mui/icons-material';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface EventItem {
  id: number;
  eventType: string;
  eventPeriod: string;
  nfcStatus: '등록' | '미등록';
  isActive: boolean;
}

const initialEvents: EventItem[] = [
  { id: 1, eventType: '스탬프', eventPeriod: '2025/08/01 ~ 2025/08/10', nfcStatus: '등록', isActive: false },
  { id: 2, eventType: '리워드', eventPeriod: '2025/10/01 ~ 2025/10/31', nfcStatus: '미등록', isActive: true },
];

export default function EventManagementContent() {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const handleToggleActive = (id: number) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === id ? { ...event, isActive: !event.isActive } : event
      )
    );
  };

  const openDeleteDialog = (id: number) => {
    setSelectedEventId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedEventId) {
      setEvents(prev => prev.filter(event => event.id !== selectedEventId));
    }
    setDeleteDialogOpen(false);
    setSelectedEventId(null);
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          이벤트 관리
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => router.push('/save/events/register')}
        >
          새 이벤트 등록
        </Button>
      </Box>

      {/* 이벤트 테이블 */}
      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>이벤트 유형</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>이벤트 기간</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>NFC 등록상태</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>서비스 설정</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event, index) => (
                <TableRow key={event.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{event.eventType}</TableCell>
                  <TableCell>{event.eventPeriod}</TableCell>
                  <TableCell>
                    <Chip 
                      label={event.nfcStatus}
                      color={event.nfcStatus === '등록' ? 'primary' : 'default'}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={event.isActive}
                          onChange={() => handleToggleActive(event.id)}
                          size="small"
                        />
                      }
                      label={event.isActive ? '활성' : '비활성'}
                      sx={{ m: 0 }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Button size="small" sx={{ minWidth: 'auto', mr: 1 }} onClick={() => console.log(`Edit event ${event.id}`)}>수정</Button>
                    <Button size="small" sx={{ minWidth: 'auto', mr: 1 }} startIcon={<FileCopy />} onClick={() => console.log(`Copy event ${event.id}`)}>복제</Button>
                    <Button size="small" color="error" sx={{ minWidth: 'auto' }} onClick={() => openDeleteDialog(event.id)}>삭제</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="이벤트 삭제"
        message="정말로 이 이벤트를 삭제하시겠습니까?"
      />
    </Box>
  );
}