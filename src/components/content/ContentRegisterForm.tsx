'use client';
import { useEffect } from 'react'; 
import { CircularProgress } from '@mui/material';
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
  FormLabel,
} from '@mui/material';
import { useCreateContent } from '@/hooks/mutation/useCreateContent';
import { ContentCreatePayload } from '@/lib/api/admin';
import MapDialog from '@/components/common/MapDialog';

import { useUpdateContent } from '@/hooks/mutation/useUpdateContent';
import { useGetContentById } from '@/hooks/query/useGetContentById';
import { ContentUpdatePayload } from '@/lib/api/admin';

import { useContentStore } from '@/store/contentStore';

type ContentType = 'story' | 'domination';
type ProgressMode = 'sequential' | 'non-sequential';

interface ContentRegisterFormProps {
  contentId?: string;
}

export default function ContentRegisterForm({ contentId }: ContentRegisterFormProps) {
  const router = useRouter();
  const createContentMutation = useCreateContent();
  const isEditMode = !!contentId;
  const { data: existingContent, isLoading: isLoadingContent } = useGetContentById(contentId);
  const updateMutation = useUpdateContent(contentId);
  const createMutation = useCreateContent()
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('story');
  const { contentToClone, setContentToClone } = useContentStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    exposureSlot: 'story',
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

  useEffect(() => {
    if (existingContent) {
      setContentType(existingContent.content_type as ContentType);
      setFormData({
        title: existingContent.title,
        description: existingContent.description || '',
        exposureSlot: existingContent.exposure_slot,
        address: '', // API에 주소 필드가 없으므로 비워둡니다.
        latitude: existingContent.center_point?.lat.toString() || '',
        longitude: existingContent.center_point?.lon.toString() || '',
        backgroundImage: null, // 이미지는 새로 업로드해야 하므로 초기화합니다.
        stageCount: existingContent.stage_count || 1,
        progressMode: existingContent.is_sequential ? 'sequential' : 'non-sequential',
        startDate: existingContent.start_at ? existingContent.start_at.split('T')[0] : '',
        endDate: existingContent.end_at ? existingContent.end_at.split('T')[0] : '',
        isAlwaysOn: existingContent.is_always_on,
        maxParticipants: '', // 이 필드들은 API에 없으므로 비워둡니다.
        isUnlimited: false,
        completionReward: existingContent.reward_coin.toString(),
        nextContent: false,
        prerequisiteContent: '',
      });
    }
  }, [existingContent]);

  useEffect(() => {
    if (!isEditMode && contentToClone) {
      setContentType(contentToClone.content_type as ContentType);
      setFormData({
        ...formData,
        title: `${contentToClone.title} [복사본]`,
        description: contentToClone.description || '',
        exposureSlot: contentToClone.exposure_slot,
        latitude: contentToClone.center_point?.lat.toString() || '',
        longitude: contentToClone.center_point?.lon.toString() || '',
        stageCount: contentToClone.stage_count || 1,
        progressMode: contentToClone.is_sequential ? 'sequential' : 'non-sequential',
        startDate: contentToClone.start_at ? contentToClone.start_at.split('T')[0] : '',
        endDate: contentToClone.end_at ? contentToClone.end_at.split('T')[0] : '',
        isAlwaysOn: contentToClone.is_always_on,
        completionReward: contentToClone.reward_coin.toString(),
      });

      setContentToClone(null);
    }
  }, [contentToClone, isEditMode, setContentToClone]);

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setFormData({
      ...formData,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, backgroundImage: e.target.files[0] });
    }
  };

  const handlePreview = () => {
    console.log('Preview');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ContentCreatePayload | ContentUpdatePayload = {
      title: formData.title,
      description: formData.description,
      content_type: contentType,
      exposure_slot: formData.exposureSlot as 'story' | 'event',
      is_always_on: formData.isAlwaysOn,
      reward_coin: Number(formData.completionReward) || 0,
      center_point:
        formData.latitude && formData.longitude
          ? { lat: Number(formData.latitude), lon: Number(formData.longitude) }
          : null,
      start_at: formData.isAlwaysOn || !formData.startDate ? null : new Date(formData.startDate).toISOString(),
      end_at: formData.isAlwaysOn || !formData.endDate ? null : new Date(formData.endDate).toISOString(),
      stage_count: Number(formData.stageCount),
      is_sequential: formData.progressMode === 'sequential',
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload as ContentCreatePayload);
    }
  };

  const isLoading = createContentMutation.isPending || updateMutation.isPending;

  if (isEditMode && isLoadingContent) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {isEditMode ? '콘텐츠 수정' : '콘텐츠 등록'}
        </Typography>
      </Box>

      <Card sx={{ boxShadow: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}><Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>1. 콘텐츠 유형</Typography><FormControl component="fieldset"><RadioGroup row value={contentType} onChange={(e) => setContentType(e.target.value as ContentType)}><FormControlLabel value="story" control={<Radio />} label="스토리형" /><FormControlLabel value="domination" control={<Radio />} label="점령전" /></RadioGroup></FormControl></Box>
            <Box sx={{ mb: 3 }}><Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>노출 위치</Typography><FormControl component="fieldset"><RadioGroup row name="exposureSlot" value={formData.exposureSlot} onChange={(e) => setFormData({ ...formData, exposureSlot: e.target.value })}><FormControlLabel value="story" control={<Radio />} label="스토리" /><FormControlLabel value="event" control={<Radio />} label="이벤트" /></RadioGroup></FormControl></Box>
            <Box sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>메인 타이틀</Typography><Box sx={{ display: 'flex', gap: 2 }}><TextField fullWidth placeholder="※ 콘텐츠 이름을 입력하세요 ex) 목포의 눈물" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /><Button variant="contained" sx={{ minWidth: 100 }}>중복검사</Button></Box></Box>
            <Box sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>설명</Typography><TextField fullWidth multiline rows={4} placeholder="한때 가장 붐비던 거리......" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required /></Box>
            
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
                <Button variant="outlined" sx={{ minWidth: 100 }}>
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
                <Button variant="contained" onClick={() => setIsMapOpen(true)} sx={{ minWidth: 120 }}>
                  지도에서 입력
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>배경 이미지 등록</Typography><input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'block', marginBottom: '8px' }} /><Typography variant="caption" color="text.secondary">※ 전체 배경 이미지 사이즈는 1080x1920 사이즈 입니다.</Typography></Box>
            <Box sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>서브 스테이지 수 설정</Typography><TextField type="number" inputProps={{ min: 1, max: 10 }} value={formData.stageCount} onChange={(e) => setFormData({ ...formData, stageCount: parseInt(e.target.value) })} sx={{ width: 120 }} /><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>※ 최소1~10 까지 설정 가능합니다.</Typography></Box>
            <Box sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>서브 콘텐츠 진행 방식</Typography><FormControl component="fieldset"><RadioGroup row value={formData.progressMode} onChange={(e) => setFormData({ ...formData, progressMode: e.target.value as ProgressMode })}><FormControlLabel value="sequential" control={<Radio />} label="순차" /><FormControlLabel value="non-sequential" control={<Radio />} label="비 순차" /></RadioGroup></FormControl></Box>
            <Box sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>이벤트 기간 설정</Typography><Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}><TextField type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} disabled={formData.isAlwaysOn} InputLabelProps={{ shrink: true }}/><Typography>~</Typography><TextField type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} disabled={formData.isAlwaysOn} InputLabelProps={{ shrink: true }}/><FormControlLabel control={<Checkbox checked={formData.isAlwaysOn} onChange={(e) => setFormData({ ...formData, isAlwaysOn: e.target.checked })}/>} label="상시"/></Box><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>※ 상시 진행 이벤트인 경우 체크</Typography></Box>
            {contentType === 'domination' && (<Box sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>최대 참여 인원</Typography><Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}><TextField type="number" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })} disabled={formData.isUnlimited} sx={{ width: 200 }}/><FormControlLabel control={<Checkbox checked={formData.isUnlimited} onChange={(e) => setFormData({ ...formData, isUnlimited: e.target.checked })}/>} label="무제한"/></Box></Box>)}
            <Box sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>전체 완료 보상</Typography><Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><TextField type="number" placeholder="코인" value={formData.completionReward} onChange={(e) => setFormData({ ...formData, completionReward: e.target.value })} sx={{ width: 200 }}/><Typography>코인</Typography></Box></Box>
            {contentType === 'story' && (<Box sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>다음 콘텐츠 설정</Typography><Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}><FormControl component="fieldset"><RadioGroup row value={formData.nextContent ? 'Y' : 'N'} onChange={(e) => setFormData({ ...formData, nextContent: e.target.value === 'Y' })}><FormControlLabel value="Y" control={<Radio />} label="Y" /><FormControlLabel value="N" control={<Radio />} label="N" /></RadioGroup></FormControl>{formData.nextContent && (<><Typography>선행 조건:</Typography><Select value={formData.prerequisiteContent} onChange={(e) => setFormData({ ...formData, prerequisiteContent: e.target.value })} sx={{ minWidth: 300 }}><MenuItem value="">선택하세요</MenuItem><MenuItem value="content1">목포의 사라진 눈물 – 원도심</MenuItem></Select></>)}</Box></Box>)}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 3 }}>
              <Button variant="contained" color="success" onClick={handlePreview}>미리보기</Button>
              <Button type="submit" variant="contained" color="warning" disabled={isLoading}>
                {isLoading ? (isEditMode ? '수정 중...' : '저장 중...') : (isEditMode ? '수정하기' : '저장하기')}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <MapDialog
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </Box>
  );
}