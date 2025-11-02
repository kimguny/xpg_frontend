// src/components/nfc/NfcManagementContent.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Search, ArrowDropDown, ViewList, ViewModule } from '@mui/icons-material';
import NfcTableView from './NfcTableView';
import NfcCardView from './NfcCardView';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useGetNfcTags } from '@/hooks/query/useGetNfcTags'; // [수정]
import { useDeleteNfcTag } from '@/hooks/mutation/useDeleteNfcTag'; // [수정]
import { useDebounce } from '@/hooks/useDebounce'; // [수정]

// (임시 데이터 삭제)

// [수정] 정렬 옵션 (백엔드 API가 현재 정렬을 지원하지 않으므로, 우선순위는 tag_name 고정)
const sortOptions = {
  'tag_name,ASC': '이름순',
  // (추후 백엔드에 정렬 기능 추가 시 여기에 옵션 추가)
};

export default function NfcManagementContent() {
  const [view, setView] = useState<'table' | 'card'>('table');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNfcId, setSelectedNfcId] = useState<string | null>(null); // [수정] ID 타입을 string으로 변경

  // [수정] API 연동을 위한 state 추가
  const [searchInput, setSearchInput] = useState(''); // 실시간 입력값
  const [searchQuery, setSearchQuery] = useState(''); // 디바운스된 검색어
  const [sort, setSort] = useState('tag_name,ASC'); // (현재는 UI 표시용)
  const [page, setPage] = useState(1); // (페이지네이션 추후 구현)

  // [수정] 디바운스 훅 사용
  const debouncedSearchQuery = useDebounce(searchInput, 500);

  // [수정] 검색어가 변경되면 API를 호출하도록 useEffect 추가
  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
    setPage(1); // 검색 시 1페이지로 리셋
  }, [debouncedSearchQuery]);

  // [수정] API 훅 호출
  const { data: nfcTagsData, isLoading } = useGetNfcTags({
    search: searchQuery,
    page: page,
    size: 20,
    // (정렬은 백엔드 구현 후 `sort` state 변수 전달)
  });
  const deleteNfcTagMutation = useDeleteNfcTag();

  const nfcTags = nfcTagsData?.items || [];

  // [수정] ID 타입을 string으로 변경
  const handleDeleteClick = (nfcId: string) => {
    setSelectedNfcId(nfcId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedNfcId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedNfcId) {
      deleteNfcTagMutation.mutate(selectedNfcId);
    }
    handleDialogClose();
  };

  // [수정] 정렬 메뉴 핸들러 추가
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleSortMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleSortMenuClose = () => {
    setAnchorEl(null);
  };
  const handleSortSelect = (sortValue: string) => {
    setSort(sortValue);
    handleSortMenuClose();
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
          {/* [수정] 정렬 버튼 로직 연결 */}
          <Button
            variant="outlined"
            size="small"
            endIcon={<ArrowDropDown />}
            sx={{ textTransform: 'none', bgcolor: 'white', ml: 1 }}
            onClick={handleSortMenuClick}
          >
            정렬: {sortOptions[sort as keyof typeof sortOptions]}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleSortMenuClose}
          >
            {Object.entries(sortOptions).map(([value, label]) => (
              <MenuItem key={value} onClick={() => handleSortSelect(value)}>
                {label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
        {/* [수정] 검색창 로직 연결 */}
        <TextField
          variant="outlined"
          size="small"
          placeholder="태그명, UDID 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
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
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : view === 'table' ? (
        <NfcTableView data={nfcTags} onDelete={handleDeleteClick} />
      ) : (
        <NfcCardView data={nfcTags} onDelete={handleDeleteClick} />
      )}
      
      {/* [수정] 삭제 확인 모달 메시지 변경 */}
      <ConfirmDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleConfirmDelete}
        title="NFC 태그 삭제"
        message={`정말로 이 태그를 삭제하시겠습니까? (ID: ${selectedNfcId})`}
        isPending={deleteNfcTagMutation.isPending}
      />
    </Box>
  );
}