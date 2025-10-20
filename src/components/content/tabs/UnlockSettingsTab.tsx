// src/components/content/tabs/UnlockSettingsTab.tsx
'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Button,
} from '@mui/material';

export default function UnlockSettingsTab() {
  const [unlockStyle, setUnlockStyle] = useState('fullscreen');

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        스테이지 해금 설정
      </Typography>

      {/* 해금 스타일 설정 */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
          해금 스타일 설정
        </FormLabel>
        <RadioGroup
          row
          value={unlockStyle}
          onChange={(e) => setUnlockStyle(e.target.value)}
        >
          <FormControlLabel value="fullscreen" control={<Radio />} label="풀 화면 형" />
          <FormControlLabel value="popup" control={<Radio />} label="팝업 형" />
        </RadioGroup>
      </FormControl>

      {/* 풀 화면 형 설정 UI */}
      {unlockStyle === 'fullscreen' && (
        <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>풀 화면 형 설정</Typography>
          <TextField fullWidth label="서브 타이틀 입력" sx={{ mb: 2 }} />
          <TextField fullWidth label="하단 텍스트 입력" sx={{ mb: 2 }} />
          <TextField
            fullWidth
            label="선택형 입력"
            defaultValue="다음 단계로 / 다음 스테이지로"
            sx={{ mb: 2 }}
          />
          <Button variant="outlined" component="label">
            이미지 등록
            <input type="file" hidden />
          </Button>
        </Card>
      )}

      {/* 팝업 형 설정 UI */}
      {unlockStyle === 'popup' && (
        <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>팝업 형 설정</Typography>
          <Typography color="text.secondary">
            팝업 형 설정 UI가 여기에 표시됩니다.
          </Typography>
        </Card>
      )}
    </Box>
  );
}