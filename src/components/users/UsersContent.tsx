'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import { Search, ArrowDropDown } from '@mui/icons-material';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { User } from '@/lib/api/admin';
import { useGetUsers } from '@/hooks/query/useGetUsers';
import { useDeleteUser } from '@/hooks/mutation/useDeleteUser';
import PointAdjustModal from './PointAdjustModal';

interface RowProps {
  user: User;
  onDeleteClick: (id: string) => void;
  onPointModifyClick: (user: User) => void;
}

function Row({ user, onDeleteClick, onPointModifyClick }: RowProps) {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>{user.login_id}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
        <TableCell>{user.profile?.name || '-'}</TableCell>
        <TableCell>{user.profile?.phone || '-'}</TableCell>
        <TableCell>{user.nickname}</TableCell>
        
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {user.profile?.points || 0}
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ ml: 1 }}
              onClick={() => onPointModifyClick(user)}
            >
              수정
            </Button>
          </Box>
        </TableCell>
        
        <TableCell>
          <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => setOpen(!open)}>
            자세히
          </Button>
          <Button variant="outlined" size="small" color="error" onClick={() => onDeleteClick(user.id)}>
            삭제
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom component="div">상세 정보</Typography>
              <Typography><strong>가입일시:</strong> {new Date(user.created_at).toLocaleString()}</Typography>
              <Typography><strong>최근 활동:</strong> {user.last_active_at ? new Date(user.last_active_at).toLocaleString() : 'N/A'}</Typography>
              <Typography><strong>상태:</strong> {user.status}</Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const sortOptions = {
  'created_at,DESC': '최신순',
  'last_active_at,DESC': '날짜순',
  'login_id,ASC': '이름순',
};

export default function UsersContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [pointModalOpen, setPointModalOpen] = useState(false);
  const [selectedUserForPoints, setSelectedUserForPoints] = useState<User | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('created_at,DESC');
  const [searchInput, setSearchInput] = useState('');
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { data: usersData, isLoading } = useGetUsers({ q: searchQuery, sort: sort });
  const deleteUserMutation = useDeleteUser();
  
  const users = usersData?.items || [];

  const handleDeleteClick = (userId: string) => {
    setSelectedUserId(userId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUserId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedUserId) {
      deleteUserMutation.mutate(selectedUserId);
    }
    handleDialogClose();
  };
  
  const handleOpenPointModal = (user: User) => {
    setSelectedUserForPoints(user);
    setPointModalOpen(true);
  };
  const handleClosePointModal = () => {
    setPointModalOpen(false);
    setSelectedUserForPoints(null);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

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
      <Box sx={{ mb: 3 }}><Typography variant="h5" sx={{ fontWeight: 'bold' }}>회원관리</Typography></Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                size="small" 
                endIcon={<ArrowDropDown />} 
                sx={{ textTransform: 'none', bgcolor: 'white' }}
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
          <TextField 
            variant="outlined" 
            size="small" 
            placeholder="아이디 검색" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            InputProps={{ startAdornment: ( <InputAdornment position="start"><Search /></InputAdornment>)}} 
            sx={{ bgcolor: 'white' }}
          />
      </Box>

      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
          <Table>
            <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>아이디</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>이메일</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>가입일</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>이름</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>핸드폰번호</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>닉네임</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>포인트</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>관리</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} align="center"><CircularProgress /></TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center">사용자가 없습니다.</TableCell></TableRow>
              ) : (
                users.map((user) => (
                  <Row 
                    key={user.id} 
                    user={user} 
                    onDeleteClick={handleDeleteClick} 
                    onPointModifyClick={handleOpenPointModal}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <ConfirmDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleConfirmDelete}
        title="회원 삭제"
        message={`정말로 ID ${selectedUserId} 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        isPending={deleteUserMutation.isPending}
      />
      
      <PointAdjustModal
        open={pointModalOpen}
        onClose={handleClosePointModal}
        user={selectedUserForPoints}
      />
    </Box>
  );
}