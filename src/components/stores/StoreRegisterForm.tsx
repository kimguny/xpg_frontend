// src/components/stores/StoreRegisterForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import RewardRegisterModal from '@/components/rewards/RewardRegisterModal'; // 상품 등록 팝업 재사용

export default function StoreRegisterForm() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        매장 등록
      </Typography>

      <Card sx={{ p: 3 }}>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="매장명" placeholder="매장명을 입력하세요" />
          <FormControl fullWidth>
            <InputLabel>카테고리</InputLabel>
            <Select label="카테고리" defaultValue="">
              <MenuItem value="bakery">베이커리</MenuItem>
              <MenuItem value="cafe">카페</MenuItem>
              <MenuItem value="restaurant">음식점</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="주소" placeholder="주소를 입력하세요" />
            <Button variant="outlined" sx={{ whiteSpace: 'nowrap' }}>주소 찾기</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="위도" />
            <TextField fullWidth label="경도" />
          </Box>
          <TextField
            label="매장 설명"
            multiline
            rows={4}
            placeholder="매장에 대한 설명을 입력하세요."
          />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              노출 기간
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField type="date" sx={{ flex: 1 }} />
              <Typography>~</Typography>
              <TextField type="date" sx={{ flex: 1 }} />
              <FormControlLabel control={<Checkbox />} label="상시" />
            </Box>
          </Box>
          <Button variant="outlined" component="label" sx={{ alignSelf: 'flex-start' }}>
            지도 노출용 이미지 등록
            <input type="file" hidden accept="image/*" />
          </Button>
        </Box>
      </Card>

      {/* 상품 추가 버튼 */}
      <Box sx={{ my: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setIsModalOpen(true)}
        >
          상품 추가
        </Button>
      </Box>

      {/* 하단 저장 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button variant="contained" size="large" color="success">
          매장 저장
        </Button>
      </Box>

      {/* 상품 추가 팝업 (재사용) */}
      <RewardRegisterModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="register"
      />
    </Box>
  );
}