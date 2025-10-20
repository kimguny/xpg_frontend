// src/components/content/tabs/PuzzleSettingsTab.tsx
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
  Switch,
  TextField,
  Button,
} from '@mui/material';

export default function PuzzleSettingsTab() {
  const [isPuzzleEnabled, setIsPuzzleEnabled] = useState(true);
  const [showWhen, setShowWhen] = useState('after_hint');
  const [puzzleStyle, setPuzzleStyle] = useState('image');
  const [answerStyle, setAnswerStyle] = useState('four_digit');

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        퍼즐 설정
      </Typography>

      {/* 퍼즐 추가 여부 */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
          퍼즐 추가 여부, 조건 설정
        </FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={isPuzzleEnabled}
              onChange={(e) => setIsPuzzleEnabled(e.target.checked)}
            />
          }
          label={isPuzzleEnabled ? '퍼즐 사용' : '퍼즐 미사용'}
        />
      </FormControl>

      {isPuzzleEnabled && (
        <>
          {/* 퍼즐 표시 설정 */}
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
              퍼즐 표시 설정
            </FormLabel>
            <RadioGroup row value={showWhen} onChange={(e) => setShowWhen(e.target.value)}>
              <FormControlLabel value="after_hint" control={<Radio />} label="힌트 하단 상시 표시" />
              <FormControlLabel value="after_stage" control={<Radio />} label="스테이지 완료 후 표시" />
            </RadioGroup>
          </FormControl>

          {/* 퍼즐 스타일 설정 */}
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
              퍼즐 스타일 설정
            </FormLabel>
            <RadioGroup row value={puzzleStyle} onChange={(e) => setPuzzleStyle(e.target.value)}>
              <FormControlLabel value="image" control={<Radio />} label="이미지" />
              <FormControlLabel value="text" control={<Radio />} label="텍스트" />
            </RadioGroup>
          </FormControl>

          {/* 이미지 퍼즐 UI */}
          {puzzleStyle === 'image' && (
            <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 2 }}>이미지 퍼즐</Typography>
              <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                이미지 등록
                <input type="file" hidden />
              </Button>
              <TextField fullWidth label="이미지 설명" placeholder="예: 목포의 특산품은?" sx={{ mb: 2 }} />
            </Card>
          )}
          
          {/* 텍스트 퍼즐 UI */}
          {puzzleStyle === 'text' && (
            <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 2 }}>텍스트 퍼즐</Typography>
              <TextField fullWidth label="퍼즐 텍스트" placeholder="예: 목포의 특산품은?" sx={{ mb: 2 }} />
            </Card>
          )}

          {/* 공통 정답 입력 UI */}
          <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                정답 입력 스타일
              </FormLabel>
              <RadioGroup row value={answerStyle} onChange={(e) => setAnswerStyle(e.target.value)}>
                <FormControlLabel value="four_digit" control={<Radio />} label="네 자리 숫자" />
                <FormControlLabel value="six_digit" control={<Radio />} label="여섯 자리 숫자" />
                <FormControlLabel value="text" control={<Radio />} label="텍스트 입력" />
              </RadioGroup>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField label="정답" sx={{ flex: 1 }} />
              <TextField label="보너스 포인트" type="number" defaultValue={0} sx={{ width: 150 }} />
            </Box>
          </Card>
        </>
      )}
    </Box>
  );
}