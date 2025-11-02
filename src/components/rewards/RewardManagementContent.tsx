// src/components/rewards/RewardManagementContent.tsx
'use client';

import { useState } from 'react';
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
  Avatar,
  Chip, // Chip을 import에 추가합니다.
  CardContent,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import RewardRegisterModal from './RewardRegisterModal';

interface StatCardProps {
  title: string;
  value: string;
}

interface RewardItem {
  id: number;
  imageUrl: string;
  productName: string;
  category: string;
  points: number;
  totalQty: number;
  remainingQty: number;
}

const initialRewards: RewardItem[] = [
  { id: 1, imageUrl: 'https://via.placeholder.com/40', productName: '목포의 눈물빵', category: '베이커리', points: 3000, totalQty: 100, remainingQty: 30 }, // 정상
  { id: 2, imageUrl: 'https://via.placeholder.com/40', productName: '새우바게트', category: '베이커리', points: 5000, totalQty: 50, remainingQty: 5 }, // 재고 임박
  { id: 3, imageUrl: 'https://via.placeholder.com/40', productName: '크림치즈 바게트', category: '베이커리', points: 4500, totalQty: 50, remainingQty: 0 }, // 품절
];

const StatCard = ({ title, value }: StatCardProps) => (
  <Card sx={{ flex: 1, textAlign: 'center' }}>
    <CardContent>
      <Typography color="text.secondary">{title}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </CardContent>
  </Card>
);

// <<<<<<<<<<<<<<<<<<< 수정된 부분 1: 재고 상태 Chip 반환 함수 >>>>>>>>>>>>>>>>>>>>
const getStatusChip = (remainingQty: number) => {
  if (remainingQty === 0) {
    return <Chip label="품절" color="error" size="small" />;
  }
  if (remainingQty <= 10) { // 재고 임박 기준을 10개 이하로 설정
    return <Chip label="임박" color="warning" size="small" />;
  }
  return <Chip label="정상" color="success" size="small" />;
};
// <<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>

export default function RewardManagementContent() {
  const [rewards, setRewards] = useState(initialRewards);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null);

  const openDeleteDialog = (id: number) => {
    setSelectedRewardId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRewardId) {
      setRewards(prev => prev.filter(r => r.id !== selectedRewardId));
    }
    setDeleteDialogOpen(false);
    setSelectedRewardId(null);
  };

  const openEditModal = (id: number) => {
    setSelectedRewardId(id);
    setEditModalOpen(true);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>리워드 관리</Typography>

      {/* 상단 통계 카드 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StatCard title="오늘 교환건수" value="10건" />
        <StatCard title="누적 교환 건수" value="1,234건" />
        <StatCard title="총 포인트 차감" value="5,432,100P" />
        <StatCard title="재고 임박" value="3개" />
      </Box>

      {/* 필터 및 등록 버튼 */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button variant="contained" disableElevation>전체</Button>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select defaultValue="all">
              <MenuItem value="all">카테고리</MenuItem>
              <MenuItem value="bakery">베이커리</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="검색어"
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setEditModalOpen(true)}>상품 등록</Button>
      </Box>

      {/* 리워드 테이블 */}
      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>이미지</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>리워드명</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>카테고리</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>필요 포인트</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>총 수량</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>잔여 수량</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rewards.map((reward) => (
                <TableRow key={reward.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell><Avatar src={reward.imageUrl} variant="rounded" /></TableCell>
                  <TableCell>{reward.productName}</TableCell>
                  <TableCell>{reward.category}</TableCell>
                  <TableCell>{reward.points.toLocaleString()} P</TableCell>
                  <TableCell>{reward.totalQty}</TableCell>
                  <TableCell>{reward.remainingQty}</TableCell>
                  {/* <<<<<<<<<<<<<<<<<<< 수정된 부분 2: 상태 Chip 표시 >>>>>>>>>>>>>>>>>>>> */}
                  <TableCell>
                    {getStatusChip(reward.remainingQty)}
                  </TableCell>
                  {/* <<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>> */}
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => openEditModal(reward.id)}>수정</Button>
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
        title="리워드 상품 삭제"
        message="정말로 이 상품을 삭제하시겠습니까?"
      />
      
      <RewardRegisterModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mode={selectedRewardId ? 'edit' : 'register'}
        storeId={""}
      />
    </Box>
  );
}