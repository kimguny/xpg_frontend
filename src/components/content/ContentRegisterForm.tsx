'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Checkbox,
  Select,
  MenuItem,
  FormLabel, // FormLabel을 import에 추가합니다.
} from '@mui/material';

type ContentType = 'story' | 'domination'; // 'territory'를 'domination'으로 수정
type ProgressMode = 'sequential' | 'non-sequential';

export default function ContentRegisterForm() {
  const router = useRouter();
  const [contentType, setContentType] = useState<ContentType>('story');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    exposureSlot: 'story', // '노출 위치' 상태 추가
    address: '',
    latitude: '',
    longitude: '',
    backgroundImage: null as File | null,
    stageCount: 1,
    progressMode: 'sequential' as ProgressMode,
    startDate: '',
    endDate: '',
    isAlwaysOn: false,
    maxParticipants: '',
    isUnlimited: false,
    completionReward: '',
    nextContent: false,
    prerequisiteContent: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, backgroundImage: e.target.files[0] });
    }
  };

  const openMapPopup = () => {
    console.log('Open map popup');
  };

  const handlePreview = () => {
    console.log('Preview');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit:', { contentType, ...formData });
    router.push('/save/content/manage');
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          콘텐츠 등록
        </Typography>
      </Box>

      <Card sx={{ boxShadow: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            {/* 콘텐츠 유형 */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  1. 콘텐츠 유형
                </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                >
                  <FormControlLabel value="story" control={<Radio />} label="스토리형" />
                  <FormControlLabel value="domination" control={<Radio />} label="점령전" />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* 노출 위치 설정 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                노출 위치
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  name="exposureSlot"
                  value={formData.exposureSlot}
                  onChange={(e) => setFormData({ ...formData, exposureSlot: e.target.value })}
                >
                  <FormControlLabel value="story" control={<Radio />} label="스토리" />
                  <FormControlLabel value="event" control={<Radio />} label="이벤트" />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* 메인 타이틀 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                메인 타이틀
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="※ 콘텐츠 이름을 입력하세요 ex) 목포의 눈물"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Button variant="contained" sx={{ minWidth: 100 }}>
                  중복검사
                </Button>
              </Box>
            </Box>

            {/* 설명 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                설명
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="한때 가장 붐비던 거리......"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Box>

            {/* ... (이하 코드는 이전과 동일) ... */}
            
            {/* 위치 설정 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                위치 설정
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="※ 행사 시작 (중심) 주소 입력"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <Button variant="outlined" onClick={openMapPopup} sx={{ minWidth: 100 }}>
                  주소 찾기
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="위도"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
                <TextField
                  fullWidth
                  placeholder="경도"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
                <Button variant="contained" onClick={openMapPopup} sx={{ minWidth: 120 }}>
                  지도에서 입력
                </Button>
              </Box>
            </Box>

            {/* 배경 이미지 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                배경 이미지 등록
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'block', marginBottom: '8px' }}
              />
              <Typography variant="caption" color="text.secondary">
                ※ 전체 배경 이미지 사이즈는 1080x1920 사이즈 입니다.
              </Typography>
            </Box>

            {/* 서브 스테이지 수 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                서브 스테이지 수 설정
              </Typography>
              <TextField
                type="number"
                inputProps={{ min: 1, max: 10 }}
                value={formData.stageCount}
                onChange={(e) => setFormData({ ...formData, stageCount: parseInt(e.target.value) })}
                sx={{ width: 120 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                ※ 최소1~10 까지 설정 가능합니다.
              </Typography>
            </Box>

            {/* 진행 방식 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                서브 콘텐츠 진행 방식
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={formData.progressMode}
                  onChange={(e) => setFormData({ ...formData, progressMode: e.target.value as ProgressMode })}
                >
                  <FormControlLabel value="sequential" control={<Radio />} label="순차" />
                  <FormControlLabel value="non-sequential" control={<Radio />} label="비 순차" />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* 이벤트 기간 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                이벤트 기간 설정
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={formData.isAlwaysOn}
                />
                <Typography>~</Typography>
                <TextField
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={formData.isAlwaysOn}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isAlwaysOn}
                      onChange={(e) => setFormData({ ...formData, isAlwaysOn: e.target.checked })}
                    />
                  }
                  label="상시"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                ※ 상시 진행 이벤트인 경우 체크
              </Typography>
            </Box>

            {/* 점령전 전용 - 최대 참여 인원 */}
            {contentType === 'domination' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  최대 참여 인원
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    disabled={formData.isUnlimited}
                    sx={{ width: 200 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isUnlimited}
                        onChange={(e) => setFormData({ ...formData, isUnlimited: e.target.checked })}
                      />
                    }
                    label="무제한"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  ※ 인원 제한이 없는 경우 체크
                </Typography>
              </Box>
            )}

            {/* 전체 완료 보상 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                전체 완료 보상
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  type="number"
                  placeholder="코인"
                  value={formData.completionReward}
                  onChange={(e) => setFormData({ ...formData, completionReward: e.target.value })}
                  sx={{ width: 200 }}
                />
                <Typography>코인</Typography>
              </Box>
            </Box>

            {/* 스토리형 전용 - 다음 콘텐츠 */}
            {contentType === 'story' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  다음 콘텐츠 설정
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={formData.nextContent ? 'Y' : 'N'}
                      onChange={(e) => setFormData({ ...formData, nextContent: e.target.value === 'Y' })}
                    >
                      <FormControlLabel value="Y" control={<Radio />} label="Y" />
                      <FormControlLabel value="N" control={<Radio />} label="N" />
                    </RadioGroup>
                  </FormControl>
                  {formData.nextContent && (
                    <>
                      <Typography>선행 조건:</Typography>
                      <Select
                        value={formData.prerequisiteContent}
                        onChange={(e) => setFormData({ ...formData, prerequisiteContent: e.target.value })}
                        sx={{ minWidth: 300 }}
                      >
                        <MenuItem value="">선택하세요</MenuItem>
                        <MenuItem value="content1">목포의 사라진 눈물 – 원도심</MenuItem>
                      </Select>
                    </>
                  )}
                </Box>
              </Box>
            )}

            {/* 버튼 */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 3 }}>
              <Button
                variant="contained"
                color="success"
                onClick={handlePreview}
              >
                미리보기
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="warning"
              >
                저장
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}