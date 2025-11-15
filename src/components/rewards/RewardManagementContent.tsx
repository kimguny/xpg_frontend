'use client';

import { useState, useMemo } from 'react';
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
  Chip,
  CardContent,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import RewardRegisterModal from './RewardRegisterModal';

import { useGetStoreRewards } from '@/hooks/query/useGetStoreRewards';
import { useDeleteStoreReward } from '@/hooks/mutation/useDeleteStoreReward';
import { GetStoreRewardsParams, StoreReward } from '@/lib/api/admin';
import { useGetAdminStats } from '@/hooks/query/useGetAdminStats';

// [수정 1] APIBasedRewardItem 타입 제거 (useMemo에서 직접 처리)

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard = ({ title, value }: StatCardProps) => (
  <Card sx={{ flex: 1, textAlign: 'center' }}>
    <CardContent>
      <Typography color="text.secondary">{title}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </CardContent>
  </Card>
);

// [수정 2] getStatusChip이 number | null 타입을 받도록 수정
const getStatusChip = (remainingQty: number | null) => {
  if (remainingQty === null) { // null은 '무제한'
    return <Chip label="정상" color="success" size="small" />;
  }
  if (remainingQty === 0) {
    return <Chip label="품절" color="error" size="small" />;
  }
  if (remainingQty <= 10) { 
    return <Chip label="임박" color="warning" size="small" />;
  }
  return <Chip label="정상" color="success" size="small" />;
};
const API_BASE_URL = 'http://121.126.223.205:8000';

export default function RewardManagementContent() {
  const [queryParams, setQueryParams] = useState<GetStoreRewardsParams>({
    page: 1,
    size: 10,
    sort: 'created_at,DESC',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetStoreRewards(queryParams);
  const apiRewards = (data?.items || []) as StoreReward[]; 
  const totalItems = data?.total || 0;

  const { data: statsData, isLoading: isStatsLoading } = useGetAdminStats();
  
  const deleteMutation = useDeleteStoreReward();

  // [수정 3] useMemo 로직 수정
  const rewards = useMemo(() => {
    return apiRewards.map(reward => {
      // '총 수량'은 initial_quantity, '잔여 수량'은 stock_qty
      const totalQty = reward.initial_quantity;
      const remainingQty = reward.stock_qty;

      return {
        id: reward.id, 
        imageUrl: reward.image_url 
                  ? (reward.image_url.startsWith('/') 
                      ? `${API_BASE_URL}${reward.image_url}` 
                      : reward.image_url) 
                  : 'https://via.placeholder.com/40',
        productName: reward.product_name,
        storeName: reward.store?.store_name || '(매장 없음)',
        category: reward.category || 'N/A',
        points: reward.price_coin,
        // [수정 3.1] totalQty, remainingQty 분리
        totalQty: totalQty === null ? '무제한' : totalQty,
        remainingQty: remainingQty === null ? '무제한' : remainingQty,
        // [수정 3.2] getStatusChip에 원본 stock_qty(number|null) 전달
        statusChip: getStatusChip(reward.stock_qty),
        store_id: reward.store_id, 
        is_active: reward.is_active,
      };
    });
  }, [apiRewards]);


  const openDeleteDialog = (id: string) => {
// ... (handleConfirmDelete, openEditModal, handlePageChange, handleSearch 함수는 동일) ...
    setSelectedRewardId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRewardId) {
      deleteMutation.mutate(selectedRewardId, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedRewardId(null);
        },
        onError: (err: Error) => {
            alert(`삭제 실패: ${err.message}`);
            setDeleteDialogOpen(false);
        }
      });
    }
  };

  const openEditModal = (id: string | null) => {
    setSelectedRewardId(id);
    setEditModalOpen(true);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
      setQueryParams(prev => ({ ...prev, page }));
  };

  const handleSearch = () => {
      setQueryParams(prev => ({ ...prev, q: searchTerm, page: 1 }));
  };

  const stats = {
    today: statsData?.today_consumed_count ?? 0,
    total: statsData?.total_consumed_count ?? 0,
    points: statsData?.total_points_spent ?? 0,
    lowStock: statsData?.low_stock_count ?? 0,
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>상품 관리</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* ... (StatCard 컴포넌트들은 동일) ... */}
        <StatCard 
          title="오늘 교환건수" 
          value={isStatsLoading ? '...' : `${stats.today.toLocaleString()}건`} 
        />
        <StatCard 
          title="누적 교환 건수" 
          value={isStatsLoading ? '...' : `${stats.total.toLocaleString()}건`} 
        />
        <StatCard 
          title="총 포인트 차감" 
          value={isStatsLoading ? '...' : `${stats.points.toLocaleString()}P`} 
        />
        <StatCard 
          title="재고 임박" 
          value={isStatsLoading ? '...' : `${stats.lowStock.toLocaleString()}개`} 
        />
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* ... (검색/필터 UI는 동일) ... */}
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            InputProps={{ 
                endAdornment: (
                    <InputAdornment position="end">
                        <Search sx={{ cursor: 'pointer' }} onClick={handleSearch} />
                    </InputAdornment>
                )
            }}
          />
        </Box>
      </Box>

      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>이미지</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>상품명</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>매장명</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>카테고리</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>필요 포인트</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>총 수량</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>잔여 수량</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>재고 상황</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                  <TableRow><TableCell colSpan={10} align="center"><CircularProgress size={24} sx={{ py: 2 }} /></TableCell></TableRow>
              ) : rewards.length === 0 ? (
                  <TableRow><TableCell colSpan={10} align="center"><Typography color="text.secondary" sx={{ py: 2 }}>등록된 리워드 상품이 없습니다.</Typography></TableCell></TableRow>
              ) : (
                rewards.map((reward) => (
                  <TableRow key={reward.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell><Avatar src={reward.imageUrl} variant="rounded" /></TableCell>
                    <TableCell>{reward.productName}</TableCell>
                    <TableCell>{reward.storeName}</TableCell>
                    <TableCell>{reward.category}</TableCell>
                    <TableCell>{reward.points.toLocaleString()} P</TableCell>
                    {/* [수정 4] totalQty와 remainingQty를 분리된 값으로 표시 */}
                    <TableCell>{reward.totalQty}</TableCell>
                    <TableCell>{reward.remainingQty}</TableCell>
                    <TableCell>
                      {reward.statusChip}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={reward.is_active ? "활성화" : "비활성화"}
                        color={reward.is_active ? "success" : "default"}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => openEditModal(reward.id as string)}>수정</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => openDeleteDialog(reward.id as string)}>삭제</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* ... (Pagination UI는 동일) ... */}
        {rewards.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, py: 2 }}>
                <Pagination
                    count={Math.ceil(totalItems / (queryParams.size || 10))}
                    page={queryParams.page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        )}
      </Card>

      {/* ... (ConfirmDialog는 동일) ... */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="리워드 상품 삭제"
        message={`정말로 리워드 ID: ${selectedRewardId} 상품을 삭제하시겠습니까?`}
        isPending={deleteMutation.isPending} 
      />
      
      {/* [수정 5] RewardRegisterModal에 storeId 전달 로직 수정 */}
      <RewardRegisterModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mode={selectedRewardId ? 'edit' : 'register'}
        rewardId={selectedRewardId}
        // [수정 5.1] 선택된 리워드의 store_id를 찾아서 전달 (apiRewards 사용)
        storeId={apiRewards.find(r => r.id === selectedRewardId)?.store_id}
      />
    </Box>
  );
}