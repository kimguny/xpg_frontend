// src/components/rewards/RewardManagementContent.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
} from '@mui/material';
import { Add } from '@mui/icons-material';

// 임시 리워드 데이터 타입
interface RewardItem {
  id: number;
  imageUrl: string;
  productName: string;
  storeName: string;
  points: number;
  totalQty: number;
  remainingQty: number;
}

// 임시 데이터
const rewards: RewardItem[] = [
  {
    id: 1,
    imageUrl: 'https://via.placeholder.com/150', // 임시 이미지 URL
    productName: '목포의 눈물빵',
    storeName: '코롬방제과',
    points: 3000,
    totalQty: 100,
    remainingQty: 30,
  },
  {
    id: 2,
    imageUrl: 'https://via.placeholder.com/150',
    productName: '새우바게트',
    storeName: '씨엘비베이커리',
    points: 5000,
    totalQty: 50,
    remainingQty: 5,
  },
  // 추가 데이터...
];

export default function RewardManagementContent() {
  const router = useRouter();

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          리워드 관리
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => console.log('Navigate to store registration')}
          >
            매장 등록
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => console.log('Navigate to product registration')}
          >
            상품 등록
          </Button>
        </Box>
      </Box>

      {/* 리워드 카드 목록 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {rewards.map((reward) => (
          <Card key={reward.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' }, boxShadow: 1 }}>
            <CardMedia
              component="img"
              height="140"
              image={reward.imageUrl}
              alt={reward.productName}
            />
            <CardContent>
              <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {reward.productName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {reward.storeName}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {reward.points.toLocaleString()} P
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2">
                  수량: {reward.remainingQty} / {reward.totalQty}
                </Typography>
                <Chip label="활성" color="success" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button size="small">수정</Button>
                <Button size="small" color="error">삭제</Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}