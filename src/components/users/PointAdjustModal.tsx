// src/components/users/PointAdjustModal.tsx

import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { User, PointAdjustPayload } from '@/lib/api/admin';
import { useAdjustPoints } from '@/hooks/mutation/useAdjustPoints';
import { useEffect } from 'react';

interface PointAdjustModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

type FormData = {
  coin_delta: number | string; // 포인트
  note: string; // 사유
};

export default function PointAdjustModal({ open, onClose, user }: PointAdjustModalProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      coin_delta: '',
      note: '',
    },
  });

  const adjustPointsMutation = useAdjustPoints();

  // 모달이 닫힐 때 폼 리셋
  useEffect(() => {
    if (!open) {
      reset({ coin_delta: '', note: '' });
    }
  }, [open, reset]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!user) return;

    const payload: PointAdjustPayload = {
      coin_delta: Number(data.coin_delta),
      note: data.note,
    };

    adjustPointsMutation.mutate(
      { userId: user.id, payload },
      {
        onSuccess: () => {
          onClose(); // 성공 시 모달 닫기
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>포인트 조정</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            <strong>{user?.nickname || user?.login_id}</strong> 님에게 포인트를 조정합니다.
          </Typography>
          <Controller
            name="coin_delta"
            control={control}
            rules={{ 
              required: '조정할 포인트를 입력하세요.',
              validate: value => Number(value) !== 0 || '0이 아닌 값을 입력하세요.'
            }}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                fullWidth
                type="number"
                label="조정할 포인트 (양수=지급, 음수=회수)"
                error={!!errors.coin_delta}
                helperText={errors.coin_delta?.message}
                sx={{ mb: 2 }}
              />
            )}
          />
          <Controller
            name="note"
            control={control}
            rules={{ required: '조정 사유를 입력하세요.', minLength: { value: 2, message: '2자 이상 입력하세요.' } }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="조정 사유 (예: 이벤트 참여, 관리자 지급)"
                error={!!errors.note}
                helperText={errors.note?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose}>취소</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={adjustPointsMutation.isPending}
          >
            {adjustPointsMutation.isPending ? '저장 중...' : '적용하기'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}