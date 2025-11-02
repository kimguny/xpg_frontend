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
  CardContent,
  CircularProgress, // [1. 추가] 로딩 스피너
} from '@mui/material';
import { Add } from '@mui/icons-material';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useGetStores } from '@/hooks/query/useGetStores'; // [2. 추가] 훅 import
import { useDeleteStore } from '@/hooks/mutation/useDeleteStore'; // [3. 추가] 훅 import

// 통계 카드용 컴포넌트
interface StatCardProps {
  title: string;
  value: string;
}

const StatCard = ({ title, value }: StatCardProps) => (
  <Card sx={{ flex: 1, textAlign: 'center' }}>
    <CardContent>
      <Typography color="text.secondary">{title}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </CardContent>
  </Card>
);

// [4. 삭제] 임시 데이터 타입 및 데이터 삭제

export default function StoreManagementContent() {
  const router = useRouter();

  // [5. 추가] API 및 다이얼로그 상태 관리
  const { data: stores, isLoading } = useGetStores();
  const deleteStoreMutation = useDeleteStore();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // [6. 추가] 삭제 버튼 핸들러
  const handleDeleteClick = (storeId: string) => {
    setSelectedStoreId(storeId);
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedStoreId(null);
  };
  const handleConfirmDelete = () => {
    if (selectedStoreId) {
      deleteStoreMutation.mutate(selectedStoreId);
    }
    handleDialogClose();
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        매장 관리
      </Typography>

      {/* 상단 통계 카드 (API 연동 전) */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StatCard title="오늘 교환건수" value="10건" />
        <StatCard title="누적 교환 건수" value="1,234건" />
        <StatCard title="총 포인트 차감" value="5,432,100P" />
        <StatCard title="재고 임박" value="3개" />
      </Box>
      
      {/* 등록 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => router.push('/save/stores/register')}
        >
          매장 등록
        </Button>
      </Box>

      {/* 매장 리스트 테이블 */}
      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>매장명</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>주소</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>등록상품갯수</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* [7. 수정] isLoading 및 stores 데이터 연동 */}
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center"><CircularProgress /></TableCell>
                </TableRow>
              ) : !stores || stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">등록된 매장이 없습니다.</TableCell>
                </TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow key={store.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    {/* [8. 수정] 실제 API 데이터 필드명 사용 */}
                    <TableCell>{store.store_name}</TableCell>
                    <TableCell>{store.address || '-'}</TableCell>
                    <TableCell>{store.rewards.length}개</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ mr: 1 }}
                        onClick={() => router.push(`/save/stores/manage/${store.id}/edit`)}
                      >
                        수정
                      </Button>
                      {/* [9. 추가] 삭제 버튼 */}
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(store.id)}
                      >
                        삭제
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* [10. 추가] 삭제 확인 다이얼로그 연동 */}
      <ConfirmDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleConfirmDelete}
        title="매장 삭제"
        message={`정말로 이 매장을 삭제하시겠습니까? 매장에 속한 모든 상품도 함께 삭제됩니다.`}
        isPending={deleteStoreMutation.isPending}
      />
    </Box>
  );
}