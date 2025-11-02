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
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useUpdatePuzzles } from '@/hooks/mutation/useUpdatePuzzles';
import { PuzzlePayload, Puzzle } from '@/lib/api/admin';

interface PuzzleSettingsTabProps {
  stageId?: string;
  puzzles: Puzzle[];
}

// [2. 수정] 폼 상태의 타입도 리터럴 타입으로 엄격하게 정의합니다.
type PuzzleFormState = {
  showWhen: 'always' | 'after_clear';
  puzzleStyle: 'image' | 'text';
  answerStyle: '4_digits' | '6_digits' | 'text';
  imageUrl: string;
  imageDesc: string;
  puzzleText: string;
  answer: string;
  bonusCoin: string;
};

// '새 퍼즐 추가' 폼의 상태를 관리하기 위한 기본값
const getDefaultFormState = (): PuzzleFormState => ({
  showWhen: 'always',
  puzzleStyle: 'image',
  answerStyle: 'text',
  imageUrl: '',
  imageDesc: '',
  puzzleText: '',
  answer: '',
  bonusCoin: '0',
});

export default function PuzzleSettingsTab({ stageId, puzzles }: PuzzleSettingsTabProps) {
  const updatePuzzlesMutation = useUpdatePuzzles(stageId);

  // [3. 수정] 폼 state는 엄격한 타입인 'PuzzleFormState'를 사용합니다.
  const [formState, setFormState] = useState<PuzzleFormState>(getDefaultFormState());

  // [4. 수정] 'any' 타입을 제거합니다. 
  // 텍스트 필드 전용 핸들러 (string만 처리)
  const handleStringChange = (
    field: 'imageUrl' | 'imageDesc' | 'puzzleText' | 'answer' | 'bonusCoin', 
    value: string
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // '새 퍼즐 추가' 버튼 클릭 시 실행될 함수
  const handleAddPuzzle = () => {
    if (!stageId) return;
    if (!formState.answer) {
      alert('정답을 입력해야 합니다.');
      return;
    }

    // [5. 수정] 'newPuzzle'은 이제 'Puzzle' 타입과 정확히 일치합니다.
    const newPuzzle: Puzzle = {
      style: formState.puzzleStyle,
      showWhen: formState.showWhen,
      config: {
        image_url: formState.puzzleStyle === 'image' ? formState.imageUrl : undefined,
        image_desc: formState.puzzleStyle === 'image' ? formState.imageDesc : undefined,
        text: formState.puzzleStyle === 'text' ? formState.puzzleText : undefined,
        answer_style: formState.answerStyle, // 타입이 이미 일치
        answer: formState.answer,
        bonus_coin: Number(formState.bonusCoin) || 0,
      }
    };
    
    // (이 부분에서 newPuzzle이 PuzzlePayload의 배열 타입과 일치하므로 TS(2322) 오류가 해결됩니다.)
    const payload: PuzzlePayload = {
      puzzles: [...puzzles, newPuzzle]
    };
    
    updatePuzzlesMutation.mutate(payload, {
      onSuccess: () => {
        alert('새 퍼즐이 추가되었습니다.');
        setFormState(getDefaultFormState()); 
      }
    });
  };

  // '삭제' 버튼 클릭 시 실행될 함수
  const handleDelete = (indexToDelete: number) => {
    if (!stageId || !confirm('이 퍼즐을 삭제하시겠습니까?')) return;
    
    const newPuzzleList = puzzles.filter((_, index) => index !== indexToDelete);
    
    const payload: PuzzlePayload = {
      puzzles: newPuzzleList
    };
    
    updatePuzzlesMutation.mutate(payload, {
      onSuccess: () => {
        alert('퍼즐이 삭제되었습니다.');
      }
    });
  };

  return (
    <Box>
      {/* 1. 퍼즐 목록 UI */}
      <Typography variant="h6" sx={{ mb: 2 }}>퍼즐 목록</Typography>
      <List dense sx={{ mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0 }}>
        {puzzles && puzzles.length > 0 ? (
          puzzles.map((puzzle, index) => (
            <ListItem 
              key={index} 
              divider={index < puzzles.length - 1}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(index)} disabled={updatePuzzlesMutation.isPending}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText 
                primary={`${index + 1}: ${puzzle.style === 'image' ? (puzzle.config.image_desc || '이미지 퍼즐') : (puzzle.config.text || '텍스트 퍼즐')}`}
                secondary={`유형: ${puzzle.style} / 정답: ${puzzle.config.answer}`} 
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="등록된 퍼즐이 없습니다." />
          </ListItem>
        )}
      </List>

      <Divider sx={{ mb: 4 }} />

      {/* 2. "새 퍼즐 추가" 폼 UI */}
      <Typography variant="h6" sx={{ mb: 3 }}>
        새 퍼즐 추가
      </Typography>
      
      <>
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ fontWeight: 600 }}>퍼즐 표시 설정</FormLabel>
          {/* [6. 수정] 'any' 대신 인라인 핸들러와 타입 캐스팅 사용 */}
          <RadioGroup 
            row 
            value={formState.showWhen} 
            onChange={(e) => setFormState(prev => ({ ...prev, showWhen: e.target.value as 'always' | 'after_clear' }))}
          >
            <FormControlLabel value="always" control={<Radio />} label="힌트 하단 상시 표시" />
            <FormControlLabel value="after_clear" control={<Radio />} label="스테이지 완료 후 표시" />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ fontWeight: 600 }}>퍼즐 스타일 설정</FormLabel>
          {/* [7. 수정] 'any' 대신 인라인 핸들러와 타입 캐스팅 사용 */}
          <RadioGroup 
            row 
            value={formState.puzzleStyle} 
            onChange={(e) => setFormState(prev => ({ ...prev, puzzleStyle: e.target.value as 'image' | 'text' }))}
          >
            <FormControlLabel value="image" control={<Radio />} label="이미지" />
            <FormControlLabel value="text" control={<Radio />} label="텍스트" />
          </RadioGroup>
        </FormControl>

        {formState.puzzleStyle === 'image' && (
          <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 2 }}>이미지 퍼즐</Typography>
            {/* [8. 수정] 'any' 대신 string 전용 핸들러 사용 */}
            <TextField fullWidth label="이미지 URL" value={formState.imageUrl} onChange={e => handleStringChange('imageUrl', e.target.value)} placeholder="https://..." sx={{ mb: 2 }} />
            <TextField fullWidth label="이미지 설명 (퍼즐 텍스트)" value={formState.imageDesc} onChange={e => handleStringChange('imageDesc', e.target.value)} placeholder="예: 목포의 특산품은?" sx={{ mb: 2 }} />
          </Card>
        )}
        
        {formState.puzzleStyle === 'text' && (
          <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 2 }}>텍스트 퍼즐</Typography>
            {/* [9. 수정] 'any' 대신 string 전용 핸들러 사용 */}
            <TextField fullWidth label="퍼즐 텍스트" value={formState.puzzleText} onChange={e => handleStringChange('puzzleText', e.target.value)} placeholder="예: 목포의 특산품은?" sx={{ mb: 2 }} />
          </Card>
        )}

        <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend" sx={{ fontWeight: 600 }}>정답 입력 스타일</FormLabel>
            {/* [10. 수정] 'any' 대신 인라인 핸들러와 타입 캐스팅 사용 */}
            <RadioGroup 
              row 
              value={formState.answerStyle} 
              onChange={(e) => setFormState(prev => ({ ...prev, answerStyle: e.target.value as '4_digits' | '6_digits' | 'text' }))}
            >
              <FormControlLabel value="4_digits" control={<Radio />} label="네 자리 숫자" />
              <FormControlLabel value="6_digits" control={<Radio />} label="여섯 자리 숫자" />
              <FormControlLabel value="text" control={<Radio />} label="텍스트 입력" />
            </RadioGroup>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* [11. 수정] 'any' 대신 string 전용 핸들러 사용 */}
            <TextField label="정답" value={formState.answer} onChange={e => handleStringChange('answer', e.target.value)} sx={{ flex: 1 }} required />
            <TextField label="보너스 포인트" type="number" value={formState.bonusCoin} onChange={e => handleStringChange('bonusCoin', e.target.value)} sx={{ width: 150 }} />
          </Box>
        </Card>
      </>

      {/* 3. "새 퍼즐 추가" 버튼 */}
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleAddPuzzle} 
          disabled={updatePuzzlesMutation.isPending}
        >
          {updatePuzzlesMutation.isPending ? '저장 중...' : '새 퍼즐 추가하기'}
        </Button>
      </Box>
    </Box>
  );
}