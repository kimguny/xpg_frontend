// src/components/nfc/NfcRegisterForm.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

// 1. 컴포넌트가 받을 props 타입 정의
interface NfcRegisterFormProps {
  mode: 'register' | 'edit';
}

export default function NfcRegisterForm({ mode }: NfcRegisterFormProps) {
  const [actionType, setActionType] = useState('url');

  const handleActionTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActionType((event.target as HTMLInputElement).value);
  };

  // 2. mode 값에 따라 텍스트를 동적으로 결정
  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'NFC 태그 수정' : 'NFC 태그 등록';
  const buttonText = isEditMode ? 'NFC 수정' : 'NFC 저장';

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        {/* 3. 동적 제목 적용 */}
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
      </Box>

      <Card sx={{ p: 3 }}>
        {/* ... (폼 내용은 이전과 동일) ... */}
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left Column */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="UDID" defaultValue="04:1F:F3:A5:66:D3:80" InputProps={{ readOnly: true }} fullWidth />
            <TextField label="태그명" placeholder="예: mokpo_001" fullWidth />
            <TextField label="설명" multiline rows={4} fullWidth />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField label="주소" fullWidth />
              <Button variant="outlined" sx={{ whiteSpace: 'nowrap', py: '15.5px' }}>주소 찾기</Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="위도" fullWidth />
              <TextField label="경도" fullWidth />
            </Box>
            <TextField label="층/위치" placeholder="예: 목포역 XX 카페 1층" fullWidth />
          </Box>
          {/* Right Column */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl component="fieldset">
              <RadioGroup row value={actionType} onChange={handleActionTypeChange}>
                <FormControlLabel value="url" control={<Radio />} label="연결 URL / 미디어 파일" />
                <FormControlLabel value="message" control={<Radio />} label="태그 시 메시지 표시" />
              </RadioGroup>
            </FormControl>
            {actionType === 'url' && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField label="연결 URL / 미디어 파일" fullWidth />
                <Button variant="outlined" sx={{ whiteSpace: 'nowrap', py: '15.5px' }}>파일 선택</Button>
              </Box>
            )}
            {actionType === 'message' && (
              <TextField label="태그 시 메시지" placeholder="예: 첫 번째 힌트 발견!" fullWidth />
            )}
            <TextField label="태그 포인트 설정" type="number" defaultValue={0} fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="사용 횟수" type="number" defaultValue={0} helperText="0은 무제한" fullWidth />
              <TextField label="쿨 다운 설정(초)" type="number" defaultValue={0} helperText="0은 없음" fullWidth />
            </Box>
            <FormControl component="fieldset">
              <Typography component="legend" variant="body2" sx={{ color: 'text.secondary' }}>활성화</Typography>
              <RadioGroup row defaultValue="Y">
                <FormControlLabel value="Y" control={<Radio />} label="Y" />
                <FormControlLabel value="N" control={<Radio />} label="N" />
              </RadioGroup>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select defaultValue="none" label="카테고리">
                <MenuItem value="none">없음</MenuItem>
                <MenuItem value="stage_hint">스테이지 힌트</MenuItem>
                <MenuItem value="checkpoint">체크 포인트</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          {/* 4. 동적 버튼 텍스트 적용 */}
          <Button variant="contained" size="large">{buttonText}</Button>
        </Box>
      </Card>
    </Box>
  );
}