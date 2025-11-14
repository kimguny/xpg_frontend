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
  Pagination,
} from '@mui/material';
import { Search, ArrowDropDown, ViewList, ViewModule } from '@mui/icons-material';
import NfcTableView from './NfcTableView';
import NfcCardView from './NfcCardView';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useGetNfcTags } from '@/hooks/query/useGetNfcTags';
import { useDeleteNfcTag } from '@/hooks/mutation/useDeleteNfcTag';
import { useDebounce } from '@/hooks/useDebounce';

// [1. 수정] 정렬 옵션 추가 (이름순, 이름역순)
const sortOptions = {
  'tag_name,ASC': '이름순 (가나다)',
  'tag_name,DESC': '이름 역순 (다나가)',
  // (참고: 백엔드 API가 'created_at' 정렬을 지원하면 여기에 추가)
  // 'created_at,DESC': '최신순',
  // 'created_at,ASC': '오래된순',
};

export default function NfcManagementContent() {
  const [view, setView] = useState<'table' | 'card'>('table');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNfcId, setSelectedNfcId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('tag_name,ASC'); // 기본 정렬 '이름순'
  const [page, setPage] = useState(1);

  const debouncedSearchQuery = useDebounce(searchInput, 500);

  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
    setPage(1);
  }, [debouncedSearchQuery]);

  // [2. 수정] API 훅 호출 시 'sort' 파라미터 전달
  const { data: nfcTagsData, isLoading } = useGetNfcTags({
    search: searchQuery,
    page: page,
    size: 20,
    sort: sort, // 선택된 정렬 옵션을 API에 전달
  });
  const deleteNfcTagMutation = useDeleteNfcTag();

  const nfcTags = nfcTagsData?.items || [];
  const totalItems = nfcTagsData?.total || 0;
  const pageSize = 20;
  const pageCount = Math.ceil(totalItems / pageSize);

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
    setPage(1); // 정렬 시 1페이지로 리셋
    handleSortMenuClose();
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
          {/* [3. 수정] 정렬 메뉴 UI 업데이트 (옵션이 2개 이상일 때만 표시) */}
          {Object.keys(sortOptions).length > 0 && (
            <>
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
            </>
          )}
        </Box>
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
      
      {/* 페이지네이션 UI */}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
      
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