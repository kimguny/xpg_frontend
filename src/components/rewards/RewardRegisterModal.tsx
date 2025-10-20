// src/components/rewards/RewardRegisterModal.tsx
'use client';

import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

interface RewardRegisterModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'register' | 'edit';
}

export default function RewardRegisterModal({ open, onClose, mode }: RewardRegisterModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {mode === 'register' ? '상품 등록' : '상품 수정'}
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>매장 선택</InputLabel>
            <Select label="매장 선택" defaultValue="">
              <MenuItem value="store1">코롬방제과</MenuItem>
              <MenuItem value="store2">씨엘비베이커리</MenuItem>
            </Select>
          </FormControl>
          <TextField label="상품명" placeholder="예: 목포의 눈물빵" />
          <Button variant="outlined" component="label">
            상품 이미지 등록
            <input type="file" hidden accept="image/*" />
          </Button>
          <TextField label="필요 포인트" type="number" placeholder="예: 3000" />
          <TextField label="총 수량" type="number" placeholder="예: 100" />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained">{mode === 'register' ? '등록' : '수정'}</Button>
      </DialogActions>
    </Dialog>
  );
}