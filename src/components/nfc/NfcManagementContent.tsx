// src/components/nfc/NfcManagementContent.tsx
'use client';

import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Button } from '@mui/material';
import { Search, ArrowDropDown, ViewList, ViewModule } from '@mui/icons-material';
import NfcTableView from './NfcTableView';
import NfcCardView from './NfcCardView';
import ConfirmDialog from '@/components/common/ConfirmDialog';

// 임시 데이터
const nfcData = [
  { id: 1, name: 'mokpo_001', location: '목포역 카페 XX 야외 벤치', udid: '04:1F:F3:A5:66:D3:80', action: '텍스트 메시지', cooldown: 0, points: 0, note: '-', isActive: true },
  { id: 2, name: 'mokpo_002', location: '목포 시민공원 입구', udid: '04:1F:F3:A5:66:D3:81', action: 'URL 이동', cooldown: 100, points: 100, note: '-', isActive: false },
];

export default function NfcManagementContent() {
  const [view, setView] = useState<'table' | 'card'>('table');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNfcId, setSelectedNfcId] = useState<number | null>(null);

  const handleDeleteClick = (nfcId: number) => {
    setSelectedNfcId(nfcId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedNfcId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedNfcId) {
      console.log(`Deleting NFC tag with ID: ${selectedNfcId}`);
      // 추후 여기에 실제 API 삭제 로직 추가
    }
    handleDialogClose();
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          NFC 관리
        </Typography>
      </Box>

      {/* 컨트롤 바 */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setView('card')}
            color={view === 'card' ? 'primary' : 'inherit'}
            sx={{ bgcolor: 'white' }}
          >
            <ViewModule />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setView('table')}
            color={view === 'table' ? 'primary' : 'inherit'}
            sx={{ bgcolor: 'white' }}
          >
            <ViewList />
          </Button>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ArrowDropDown />}
            sx={{ textTransform: 'none', bgcolor: 'white', ml: 1 }}
          >
            정렬: 최신순
          </Button>
        </Box>
        <TextField
          variant="outlined"
          size="small"
          placeholder="검색어 입력"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: 'white' }}
        />
      </Box>

      {/* 콘텐츠 영역 */}
      {view === 'table' ? (
        <NfcTableView data={nfcData} onDelete={handleDeleteClick} />
      ) : (
        <NfcCardView data={nfcData} onDelete={handleDeleteClick} />
      )}
      
      <ConfirmDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleConfirmDelete}
        title="NFC 태그 삭제"
        message={`정말로 ID ${selectedNfcId} 태그를 삭제하시겠습니까?`}
      />
    </Box>
  );
}