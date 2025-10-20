// src/components/content/tabs/HintSettingsTab.tsx
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
} from '@mui/material';

export default function HintSettingsTab() {
  const [hintPreset, setHintPreset] = useState('cardSwipe'); // 힌트 프리셋 상태

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        힌트 설정
      </Typography>

      {/* 힌트 스타일 선택 */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
          1. 힌트 스타일 설정
        </FormLabel>
        <RadioGroup
          row
          value={hintPreset}
          onChange={(e) => setHintPreset(e.target.value)}
        >
          <FormControlLabel value="cardSwipe" control={<Radio />} label="카드 스와이프형" />
          <FormControlLabel value="topImage" control={<Radio />} label="상단 이미지형" />
          <FormControlLabel value="middleImage" control={<Radio />} label="중간 이미지형" />
          <FormControlLabel value="timeAttack" control={<Radio />} label="타임어택형" />
          <FormControlLabel value="arCamera" control={<Radio />} label="AR 카메라형" />
        </RadioGroup>
      </FormControl>

      {/* 선택된 프리셋에 따른 설정 UI */}
      <Box>
        {hintPreset === 'arCamera' && (
          <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              AR 카메라형 설정
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              AR 카메라 위에 표시될 이미지 레이어를 등록하세요.
            </Typography>
            <input
              type="file"
              accept="image/*"
              // onChange={handleArImageUpload}
            />
          </Card>
        )}
        
        {/* 다른 프리셋들은 임시 텍스트로 표시 */}
        {hintPreset !== 'arCamera' && (
          <Typography color="text.secondary">
            &apos;{hintPreset}&apos; 프리셋에 대한 상세 설정 UI가 여기에 표시됩니다.
          </Typography>
        )}
      </Box>
    </Box>
  );
}