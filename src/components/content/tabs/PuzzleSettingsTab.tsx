'use client';

import { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { useGetStageById } from '@/hooks/query/useGetStageById';
import { useUpdatePuzzles } from '@/hooks/mutation/useUpdatePuzzles';
import { PuzzlePayload } from '@/lib/api/admin';

interface PuzzleSettingsTabProps {
  stageId?: string;
}

export default function PuzzleSettingsTab({ stageId }: PuzzleSettingsTabProps) {
  const { data: existingStage, isLoading } = useGetStageById(stageId);
  const updatePuzzlesMutation = useUpdatePuzzles(stageId);

  const [isPuzzleEnabled, setIsPuzzleEnabled] = useState(false);
  const [showWhen, setShowWhen] = useState('always');
  const [puzzleStyle, setPuzzleStyle] = useState('image');
  const [answerStyle, setAnswerStyle] = useState('text');
  
  const [imageUrl, setImageUrl] = useState('');
  const [imageDesc, setImageDesc] = useState('');
  const [puzzleText, setPuzzleText] = useState('');
  const [answer, setAnswer] = useState('');
  const [bonusCoin, setBonusCoin] = useState('0');

  useEffect(() => {
    if (existingStage?.puzzles && existingStage.puzzles.length > 0) {
      setIsPuzzleEnabled(true);
      const puzzle = existingStage.puzzles[0];
      const config = puzzle.config || {};
      
      setShowWhen(puzzle.showWhen);
      setPuzzleStyle(puzzle.style);
      setAnswerStyle(config.answer_style || 'text');
      setAnswer(config.answer || '');
      setBonusCoin(config.bonus_coin?.toString() || '0');
      setImageUrl(config.image_url || '');
      setImageDesc(config.image_desc || '');
      setPuzzleText(config.text || '');
    } else {
      setIsPuzzleEnabled(false);
    }
  }, [existingStage]);

  // ✨ 1. '저장' 버튼을 누르면 실행될 함수를 추가합니다.
  const handleSave = () => {
    console.log("handleSave function called. stageId:", stageId);
    if (!stageId) return;

    let payload: PuzzlePayload;

    if (!isPuzzleEnabled) {
      // 퍼즐 미사용 시, 빈 배열을 보내 기존 퍼즐을 삭제합니다.
      payload = { puzzles: [] };
    } else {
      // 퍼즐 사용 시, 현재 state 값으로 payload를 구성합니다.
      payload = {
        puzzles: [{
          style: puzzleStyle as 'image' | 'text',
          showWhen: showWhen as 'always' | 'after_clear',
          config: {
            image_url: puzzleStyle === 'image' ? imageUrl : undefined,
            image_desc: puzzleStyle === 'image' ? imageDesc : undefined,
            text: puzzleStyle === 'text' ? puzzleText : undefined,
            answer_style: answerStyle as '4_digits' | '6_digits' | 'text',
            answer: answer,
            bonus_coin: Number(bonusCoin) || 0,
          }
        }]
      };
    }
    // API 호출을 실행합니다.
    updatePuzzlesMutation.mutate(payload);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        퍼즐 설정
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ fontWeight: 600 }}>퍼즐 추가 여부</FormLabel>
        <FormControlLabel
          control={<Switch checked={isPuzzleEnabled} onChange={(e) => setIsPuzzleEnabled(e.target.checked)} />}
          label={isPuzzleEnabled ? '퍼즐 사용' : '퍼즐 미사용'}
        />
      </FormControl>

      {isPuzzleEnabled && (
        <>
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ fontWeight: 600 }}>퍼즐 표시 설정</FormLabel>
            <RadioGroup row value={showWhen} onChange={(e) => setShowWhen(e.target.value)}>
              <FormControlLabel value="always" control={<Radio />} label="힌트 하단 상시 표시" />
              <FormControlLabel value="after_clear" control={<Radio />} label="스테이지 완료 후 표시" />
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ fontWeight: 600 }}>퍼즐 스타일 설정</FormLabel>
            <RadioGroup row value={puzzleStyle} onChange={(e) => setPuzzleStyle(e.target.value)}>
              <FormControlLabel value="image" control={<Radio />} label="이미지" />
              <FormControlLabel value="text" control={<Radio />} label="텍스트" />
            </RadioGroup>
          </FormControl>

          {puzzleStyle === 'image' && (
            <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 2 }}>이미지 퍼즐</Typography>
              <TextField fullWidth label="이미지 URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." sx={{ mb: 2 }} />
              <TextField fullWidth label="이미지 설명" value={imageDesc} onChange={e => setImageDesc(e.target.value)} placeholder="예: 목포의 특산품은?" sx={{ mb: 2 }} />
            </Card>
          )}
          
          {puzzleStyle === 'text' && (
            <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 2 }}>텍스트 퍼즐</Typography>
              <TextField fullWidth label="퍼즐 텍스트" value={puzzleText} onChange={e => setPuzzleText(e.target.value)} placeholder="예: 목포의 특산품은?" sx={{ mb: 2 }} />
            </Card>
          )}

          <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend" sx={{ fontWeight: 600 }}>정답 입력 스타일</FormLabel>
              <RadioGroup row value={answerStyle} onChange={(e) => setAnswerStyle(e.target.value)}>
                <FormControlLabel value="4_digits" control={<Radio />} label="네 자리 숫자" />
                <FormControlLabel value="6_digits" control={<Radio />} label="여섯 자리 숫자" />
                <FormControlLabel value="text" control={<Radio />} label="텍스트 입력" />
              </RadioGroup>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField label="정답" value={answer} onChange={e => setAnswer(e.target.value)} sx={{ flex: 1 }} required />
              <TextField label="보너스 포인트" type="number" value={bonusCoin} onChange={e => setBonusCoin(e.target.value)} sx={{ width: 150 }} />
            </Box>
          </Card>
        </>
      )}

      {/* ✨ 2. '저장' 버튼을 추가하고 onClick에 handleSave 함수를 연결합니다. */}
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleSave} 
          disabled={updatePuzzlesMutation.isPending}
        >
          {updatePuzzlesMutation.isPending ? '저장 중...' : '퍼즐 정보 저장'}
        </Button>
      </Box>
    </Box>
  );
}