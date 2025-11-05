// src/components/rewards/RewardManagementContent.tsx
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
  Chip, // Chip을 import에 추가합니다.
  CardContent,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  CircularProgress, // 로딩 인디케이터 추가
  Pagination, // 페이지네이션 컴포넌트 추가
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import RewardRegisterModal from './RewardRegisterModal';

// ======================================================================
//  API 연동을 위해 훅 및 타입 임포트 (추가)
// ======================================================================
import { useGetStoreRewards } from '@/hooks/query/useGetStoreRewards';
import { useDeleteStoreReward } from '@/hooks/mutation/useDeleteStoreReward';
import { GetStoreRewardsParams, StoreReward } from '@/lib/api/admin';
import { useGetAdminStats } from '@/hooks/query/useGetAdminStats';

// ----------------------------------------------------------------------
//  기존 타입 및 상수 재정의 (API 연동에 맞게)
// ----------------------------------------------------------------------

//  API 응답 타입(StoreReward)을 기반으로 인터페이스를 정의합니다.
//    (StoreReward 타입이 id: string, image_url 등으로 정의되어 있다고 가정)
type APIBasedRewardItem = StoreReward & {
  // UI 호환성을 위해 임시로 remainingQty 추가. (실제 DB에 없으므로 재고 수량으로 대체)
  remainingQty: number; 
};

interface StatCardProps {
  title: string;
  //  API 연동을 위해 value 타입을 string | number로 확장
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

const getStatusChip = (remainingQty: number) => {
  if (remainingQty === 0) {
    return <Chip label="품절" color="error" size="small" />;
  }
  if (remainingQty <= 10) { 
    return <Chip label="임박" color="warning" size="small" />;
  }
  return <Chip label="정상" color="success" size="small" />;
};
const API_BASE_URL = 'http://121.126.223.205:8000';
// ----------------------------------------------------------------------
//  메인 컴포넌트 (API 연동)
// ----------------------------------------------------------------------
export default function RewardManagementContent() {
  //  상태: 쿼리 및 페이징 파라미터 관리 (기존 상태는 삭제)
  const [queryParams, setQueryParams] = useState<GetStoreRewardsParams>({
    page: 1,
    size: 10,
    sort: 'created_at,DESC',
    //  TODO: 매장 관리 페이지에서 넘어왔다면 store_id 필터 추가 필요
  });
  const [searchTerm, setSearchTerm] = useState('');

  //  UI 상태 관리
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  //  ID를 string (UUID)으로 변경
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  //  훅: 데이터 조회
  const { data, isLoading, isFetching } = useGetStoreRewards(queryParams);
  //  API 데이터 사용
  const apiRewards = (data?.items || []) as StoreReward[]; 
  const totalItems = data?.total || 0;

  // admin-stats 훅 호출
  const { data: statsData, isLoading: isStatsLoading } = useGetAdminStats();
  
  //  훅: 상품 삭제
  const deleteMutation = useDeleteStoreReward();

  //  UI 표시용 데이터 (API 필드명을 UI 필드명에 맞게 조정)
  //    (remainingQty와 category는 API에 없으므로 임시로 처리)
  const rewards = useMemo(() => {
    return apiRewards.map(reward => ({
      // 기존 UI 필드명 (id: number, imageUrl, productName, points, totalQty, remainingQty)에 맞춤
      id: reward.id, // string(UUID) 사용
      imageUrl: reward.image_url 
                ? (reward.image_url.startsWith('/') 
                    ? `${API_BASE_URL}${reward.image_url}` 
                    : reward.image_url) 
                : 'https://via.placeholder.com/40',
      productName: reward.product_name,
      category: 'N/A', // DB/API에 카테고리 필드가 없으므로 N/A 처리
      points: reward.price_coin,
      totalQty: reward.stock_qty === null ? 99999 : reward.stock_qty, // null이면 무제한으로 표시
      remainingQty: reward.stock_qty === null ? 99999 : reward.stock_qty, // 재고 상태 표시를 위해 임시로 stock_qty 재사용
      store_id: reward.store_id, // 모달에 전달하기 위해 추가
    }));
  }, [apiRewards]);


  //  이벤트 핸들러: 삭제 (ID 타입을 string으로 변경)
  const openDeleteDialog = (id: string) => {
    setSelectedRewardId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRewardId) {
      //  API 호출로 변경
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

  //  이벤트 핸들러: 수정/등록 모달 (ID 타입을 string으로 변경)
  const openEditModal = (id: string | null) => {
    setSelectedRewardId(id);
    setEditModalOpen(true);
  };

  //  이벤트 핸들러: 페이지네이션
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
      setQueryParams(prev => ({ ...prev, page }));
  };

  //  이벤트 핸들러: 검색
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

      {/* 상단 통계 카드 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
              {isLoading || isFetching ? (
                  <TableRow><TableCell colSpan={8} align="center"><CircularProgress size={24} sx={{ py: 2 }} /></TableCell></TableRow>
              ) : rewards.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center"><Typography color="text.secondary" sx={{ py: 2 }}>등록된 리워드 상품이 없습니다.</Typography></TableCell></TableRow>
              ) : (
                rewards.map((reward) => (
                  <TableRow key={reward.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell><Avatar src={reward.imageUrl} variant="rounded" /></TableCell>
                    <TableCell>{reward.productName}</TableCell>
                    <TableCell>{reward.category}</TableCell>
                    <TableCell>{reward.points.toLocaleString()} P</TableCell>
                    {/*  총 수량 (totalQty) 필드는 DB에서 stock_qty임 */}
                    <TableCell>{reward.totalQty === 99999 ? '무제한' : reward.totalQty}</TableCell>
                    {/*  잔여 수량 (remainingQty) 필드는 DB에서 stock_qty임 */}
                    <TableCell>{reward.remainingQty === 99999 ? '무제한' : reward.remainingQty}</TableCell>
                    <TableCell>
                      {getStatusChip(reward.remainingQty)}
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
        {/*  페이지네이션 */}
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="리워드 상품 삭제"
        message={`정말로 리워드 ID: ${selectedRewardId} 상품을 삭제하시겠습니까?`}
        isPending={deleteMutation.isPending} 
      />
      
      <RewardRegisterModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mode={selectedRewardId ? 'edit' : 'register'}
        rewardId={selectedRewardId}
        storeId={rewards.length > 0 ? rewards[0].store_id : 'DUMMY_STORE_ID'}
      />
    </Box>
  );
} 