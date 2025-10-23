'use client';

import { Box, Typography, Button, TextField, CircularProgress, List, ListItem, ListItemText, RadioGroup, FormControlLabel, Radio, FormLabel, FormControl } from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useGetHints } from '@/hooks/query/useGetHints';
import { useCreateHint } from '@/hooks/mutation/useCreateHint';
import { HintCreatePayload } from '@/lib/api/admin';

// 1. 컴포넌트가 stageId를 props로 받도록 수정합니다.
interface HintSettingsTabProps {
  stageId?: string;
}

// 2. 폼 데이터 타입을 API 페이로드에 맞게 정의합니다.
type HintFormData = Omit<HintCreatePayload, 'order_no'>; // order_no는 자동으로 계산

export default function HintSettingsTab({ stageId }: HintSettingsTabProps) {
  // 3. 데이터 조회 및 생성 훅을 사용합니다.
  const { data: hints, isLoading: isLoadingHints } = useGetHints(stageId);
  const createHintMutation = useCreateHint(stageId);

  // 4. react-hook-form을 설정합니다.
  const { control, handleSubmit, reset, watch } = useForm<HintFormData>({
    defaultValues: {
      preset: 'cardSwipe', // 화면설계서의 '카드 스와이프형'을 기본값으로 추정
      text_blocks: [''],
      cooldown_sec: 0,
      reward_coin: 0,
      nfc_id: null,
    },
  });

  // 현재 선택된 프리셋 값을 구독합니다.
  const selectedPreset = watch('preset');

  // 5. 폼 제출 시 실행될 함수입니다.
  const onSubmit: SubmitHandler<HintFormData> = (data) => {
    // order_no는 현재 힌트 개수 + 1로 자동 설정합니다.
    const payload = { ...data, order_no: (hints?.length || 0) + 1 };
    
    createHintMutation.mutate(payload, {
      onSuccess: () => {
        // 성공 시 폼을 다음 순서로 리셋합니다.
        reset({ 
          preset: 'cardSwipe', 
          text_blocks: [''],
        });
      },
    });
  };

  // 6. 데이터 로딩 중일 때 로딩 아이콘을 표시합니다.
  if (isLoadingHints) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>힌트 목록</Typography>
      <List dense sx={{ mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0 }}>
        {hints && hints.length > 0 ? (
          hints.map((hint, index) => (
            <ListItem key={hint.id} divider={index < hints.length - 1}>
              <ListItemText 
                primary={`#${hint.order_no}: ${hint.text_block_1 || '(내용 없음)'}`} 
                secondary={`프리셋: ${hint.preset}`} 
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="등록된 힌트가 없습니다." />
          </ListItem>
        )}
      </List>

      <Typography variant="h6" sx={{ mb: 2 }}>새 힌트 추가</Typography>
      {/* 7. 폼 제출 핸들러를 연결합니다. */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">힌트 스타일 설정</FormLabel>
          <Controller
            name="preset"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field} row>
                <FormControlLabel value="cardSwipe" control={<Radio />} label="카드 스와이프형" />
                <FormControlLabel value="topImage" control={<Radio />} label="상단 이미지형" />
                {/* ... 다른 프리셋들 */}
              </RadioGroup>
            )}
          />
        </FormControl>

        {/* 현재는 텍스트를 입력하는 기본 힌트만 구현합니다. */}
        <Controller
          name="text_blocks.0"
          control={control}
          rules={{ required: '힌트 내용은 필수입니다.' }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="힌트 내용"
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 2 }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
        
        <Button type="submit" variant="contained" disabled={createHintMutation.isPending}>
          {createHintMutation.isPending ? '추가 중...' : '힌트 추가'}
        </Button>
      </form>
    </Box>
  );
}