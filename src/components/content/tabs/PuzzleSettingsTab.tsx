'use client';

// [1. 수정] import 문 확장
import { useState, useRef, ChangeEvent } from 'react';
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
  Avatar,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useUpdatePuzzles } from '@/hooks/mutation/useUpdatePuzzles';
import { PuzzlePayload, Puzzle } from '@/lib/api/admin';
// [2. 추가] 이미지 업로드용 훅 및 유틸리티 import
import { useUploadImage } from '@/hooks/mutation/useUploadImage';

// [3. 추가] API Base URL
const API_BASE_URL = 'http://121.126.223.205:8000';

interface PuzzleSettingsTabProps {
  stageId?: string;
  puzzles: Puzzle[];
}

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
  const [formState, setFormState] = useState<PuzzleFormState>(getDefaultFormState());

  // [4. 추가] 이미지 업로드 훅 및 ref
  const uploadImageMutation = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // [5. 수정] 텍스트 필드 핸들러 (imageUrl 제외)
  const handleStringChange = (
    field: 'imageDesc' | 'puzzleText' | 'answer' | 'bonusCoin', 
    value: string
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // [6. 추가] 이미지 업로드 핸들러
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    uploadImageMutation.mutate(formData, {
        onSuccess: (data) => {
            // useState(formState)의 imageUrl을 직접 업데이트
            setFormState(prev => ({ ...prev, imageUrl: data.file_path }));
        },
        onError: (err) => {
            alert(`이미지 업로드 실패: ${err.message}`);
        }
    });
    e.target.value = '';
  };

  // [7. 추가] 이미지 URL 변환
  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${API_BASE_URL}${url}` : url;
  };

  const handleAddPuzzle = () => {
    if (!stageId) return;
    if (!formState.answer) {
      alert('정답을 입력해야 합니다.');
      return;
    }

    const newPuzzle: Puzzle = {
      style: formState.puzzleStyle,
      showWhen: formState.showWhen,
      config: {
        image_url: formState.puzzleStyle === 'image' ? formState.imageUrl : undefined,
        image_desc: formState.puzzleStyle === 'image' ? formState.imageDesc : undefined,
        text: formState.puzzleStyle === 'text' ? formState.puzzleText : undefined,
        answer_style: formState.answerStyle,
        answer: formState.answer,
        bonus_coin: Number(formState.bonusCoin) || 0,
      }
    };
    
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

      <Typography variant="h6" sx={{ mb: 3 }}>
        새 퍼즐 추가
      </Typography>
      
      <>
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ fontWeight: 600 }}>퍼즐 표시 설정</FormLabel>
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
            
            {/* [8. 수정] 이미지 업로드 UI로 변경 */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, mb: 2, bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadImageMutation.isPending}
                  sx={{ minWidth: 80, py: '8.5px' }}
                >
                  {uploadImageMutation.isPending ? '업로드 중...' : '파일 선택'}
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }} 
                />
                <TextField 
                  fullWidth 
                  label="이미지 URL" 
                  value={formState.imageUrl} 
                  onChange={e => setFormState(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://... 또는 파일 업로드" 
                  sx={{ mb: 0 }} 
                  size="small"
                  disabled={uploadImageMutation.isPending}
                />
              </Box>
              {formState.imageUrl && (
                <Avatar
                  src={getFullImageUrl(formState.imageUrl)}
                  alt="미리보기" 
                  variant="rounded"
                  sx={{ width: 150, height: 150, mt: 1, border: '1px solid', borderColor: 'grey.300' }}
                />
              )}
            </Box>

            <TextField fullWidth label="이미지 설명 (퍼즐 텍스트)" value={formState.imageDesc} onChange={e => handleStringChange('imageDesc', e.target.value)} placeholder="예: 목포의 특산품은?" sx={{ mb: 2 }} />
          </Card>
        )}
        
        {formState.puzzleStyle === 'text' && (
          <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 2 }}>텍스트 퍼즐</Typography>
            <TextField fullWidth label="퍼즐 텍스트" value={formState.puzzleText} onChange={e => handleStringChange('puzzleText', e.target.value)} placeholder="예: 목포의 특산품은?" sx={{ mb: 2 }} />
          </Card>
        )}

        <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend" sx={{ fontWeight: 600 }}>정답 입력 스타일</FormLabel>
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
            <TextField label="정답" value={formState.answer} onChange={e => handleStringChange('answer', e.target.value)} sx={{ flex: 1 }} required />
            <TextField label="보너스 포인트" type="number" value={formState.bonusCoin} onChange={e => handleStringChange('bonusCoin', e.target.value)} sx={{ width: 150 }} />
          </Box>
        </Card>
      </>

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