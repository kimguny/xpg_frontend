// src/components/stores/StoreManagementContent.tsx
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
} from '@mui/material';
import { Add } from '@mui/icons-material';
import ConfirmDialog from '@/components/common/ConfirmDialog';

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

// 임시 매장 데이터 타입
interface StoreItem {
  id: number;
  storeName: string;
  address: string;
  productCount: number;
}

// 임시 데이터
const initialStores: StoreItem[] = [
  { id: 1, storeName: '코롬방제과', address: '전라남도 목포시 노적봉길 9', productCount: 2 },
  { id: 2, storeName: '씨엘비베이커리', address: '전라남도 목포시 영산로75번길 14', productCount: 3 },
];

export default function StoreManagementContent() {
  const router = useRouter();
  const [stores, setStores] = useState(initialStores);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        매장 관리
      </Typography>

      {/* 상단 통계 카드 (리워드와 동일) */}
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
              {stores.map((store) => (
                <TableRow key={store.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>{store.storeName}</TableCell>
                  <TableCell>{store.address}</TableCell>
                  <TableCell>{store.productCount}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => router.push(`/save/stores/${store.id}/edit`)} // 수정 페이지로 이동
                    >
                      수정
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}