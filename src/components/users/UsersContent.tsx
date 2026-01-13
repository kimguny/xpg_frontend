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
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Search, ArrowDropDown } from '@mui/icons-material';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { User } from '@/lib/api/admin';
import { useGetUsers } from '@/hooks/query/useGetUsers';
import { useDeleteUser } from '@/hooks/mutation/useDeleteUser';
import { useResetAllPoints } from '@/hooks/mutation/useResetAllPoints';
import PointAdjustModal from './PointAdjustModal';

// [타입 정의] 에러 응답 객체 구조 정의 (any 대체)
interface ApiErrorResponse {
  response?: {
    status: number;
    data?: {
      detail?: string;
    };
  };
}

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
            {(user.profile?.points || 0).toLocaleString()}
          </Box>
        </TableCell>
        
        <TableCell>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => onPointModifyClick(user)}
            >
              포인트 조정
            </Button>
          <Button variant="outlined" size="small" sx={{ mr: 1, ml: 1 }} onClick={() => setOpen(!open)}>
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

const sortOptions: Record<string, string> = {
  'created_at,DESC': '최신순',
  'last_active_at,DESC': '날짜순',
  'login_id,ASC': '이름순',
};

export default function UsersContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [pointModalOpen, setPointModalOpen] = useState(false);
  const [selectedUserForPoints, setSelectedUserForPoints] = useState<User | null>(null);
  
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('created_at,DESC');
  const [searchInput, setSearchInput] = useState('');
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  // Hooks
  const { data: usersData, isLoading } = useGetUsers({ 
    q: searchQuery, 
    sort: sort,
    page: page,
    size: rowsPerPage,
  });
  
  const deleteUserMutation = useDeleteUser();
  const resetPointsMutation = useResetAllPoints();
  
  const users = usersData?.items || [];
  const totalUsers = usersData?.total || 0;
  const pageCount = Math.ceil(totalUsers / rowsPerPage);

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
    setPage(1); 
    setSearchQuery(searchInput);
  };

  const handleSortMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleSortMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleSortSelect = (sortValue: string) => {
    setPage(1);
    setSort(sortValue);
    handleSortMenuClose();
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleResetClick = () => {
    setAdminPassword('');
    setResetError(null);
    setResetDialogOpen(true);
  };

  const handleResetConfirm = () => {
    if (!adminPassword) {
      setResetError("비밀번호를 입력해주세요.");
      return;
    }
    setResetError(null);

    resetPointsMutation.mutate(adminPassword, {
      onSuccess: (data) => {
        alert(data.message || "모든 유저의 포인트가 초기화되었습니다.");
        setResetDialogOpen(false);
        setAdminPassword('');
      },
      onError: (error: unknown) => {
        // unknown 타입을 ApiErrorResponse로 타입 캐스팅하여 처리
        const apiError = error as ApiErrorResponse;
        if (apiError.response?.status === 400) {
          setResetError("비밀번호가 일치하지 않습니다.");
        } else {
          setResetError("초기화 중 오류가 발생했습니다.");
        }
      }
    });
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
                정렬: {sortOptions[sort]}
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
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button 
              variant="contained" 
              color="error" 
              size="small"
              onClick={handleResetClick}
              sx={{ fontWeight: 'bold', height: '40px' }}
            >
              전체 포인트 리셋
            </Button>

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

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

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

      <Dialog 
        open={resetDialogOpen} 
        onClose={() => !resetPointsMutation.isPending && setResetDialogOpen(false)}
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>전체 포인트 리셋</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            모든 회원의 포인트를 0으로 초기화합니다.<br/>
            현재 잔액만큼 차감 내역이 생성되며, 이 작업은 되돌릴 수 없습니다.<br/><br/>
            <strong>진행하려면 관리자 비밀번호를 입력하세요.</strong>
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="관리자 비밀번호"
            type="password"
            fullWidth
            variant="outlined"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            error={!!resetError}
            helperText={resetError}
            disabled={resetPointsMutation.isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleResetConfirm();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setResetDialogOpen(false)} 
            disabled={resetPointsMutation.isPending}
          >
            취소
          </Button>
          <Button 
            onClick={handleResetConfirm} 
            color="error" 
            variant="contained"
            disabled={resetPointsMutation.isPending}
          >
            {resetPointsMutation.isPending ? <CircularProgress size={24} color="inherit"/> : "초기화 실행"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}