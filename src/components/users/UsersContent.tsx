// src/components/users/UsersContent.tsx
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
} from '@mui/material';
import { Search, ArrowDropDown } from '@mui/icons-material';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface User {
  no: number;
  email: string;
  joinDate: string;
  name: string;
  phone: string;
  nickname: string;
  points: number;
  details: {
    joinDateTime: string;
    lastPlayDate: string;
    playTime: string;
    recentContent: string;
  }
}

const users: User[] = [
    { no: 1, email: 'abcsss@naver.com', joinDate: '25/07/22', name: '-', phone: '-', nickname: '목포킹', points: 0, details: { joinDateTime: '2025년 7월 22일 18:56', lastPlayDate: '2025/10/12', playTime: '60분', recentContent: '목포의 눈물', } },
    { no: 2, email: 'test@example.com', joinDate: '25/07/21', name: '김테스트', phone: '010-1234-5678', nickname: '테스터', points: 150, details: { joinDateTime: '2025년 7월 21일 10:30', lastPlayDate: '2025/10/10', playTime: '120분', recentContent: '사라진 장미', } },
];

function Row({ user, onDeleteClick }: { user: User, onDeleteClick: (id: number) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>{user.no}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.joinDate}</TableCell>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.phone}</TableCell>
        <TableCell>{user.nickname}</TableCell>
        <TableCell>{user.points}</TableCell>
        <TableCell>
          <Button
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => setOpen(!open)}
          >
            자세히
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            color="error" 
            onClick={() => onDeleteClick(user.no)}
          >
            삭제
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                상세 정보
              </Typography>
              <Box>
                <Typography variant="body2"><strong>가입일시:</strong> {user.details.joinDateTime}</Typography>
                <Typography variant="body2"><strong>플레이 참여 일:</strong> {user.details.lastPlayDate}</Typography>
                <Typography variant="body2"><strong>플레이 타임:</strong> {user.details.playTime}</Typography>
                <Typography variant="body2"><strong>최근 참여 콘텐츠:</strong> {user.details.recentContent}</Typography>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}


export default function UsersContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleDeleteClick = (userId: number) => {
    setSelectedUserId(userId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUserId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedUserId) {
      console.log(`Deleting user with ID: ${selectedUserId}`);
    }
    handleDialogClose();
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}><Typography variant="h5" sx={{ fontWeight: 'bold' }}>회원관리</Typography></Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button variant="outlined" size="small" endIcon={<ArrowDropDown />} sx={{ textTransform: 'none', bgcolor: 'white' }}>정렬: 최신순</Button>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>최신순/날짜순/이름순</Typography>
          </Box>
          <TextField variant="outlined" size="small" placeholder="검색어 입력" InputProps={{ startAdornment: ( <InputAdornment position="start"><Search /></InputAdornment>),}} sx={{ bgcolor: 'white' }}/>
      </Box>

      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
          <Table>
            <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>NO</TableCell>
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
              {/* 이 부분이 수정되었습니다 */}
              {users.map((user) => (
                <Row key={user.no} user={user} onDeleteClick={handleDeleteClick} />
              ))}
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
      />
    </Box>
  );
}