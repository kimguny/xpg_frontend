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
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';

interface StageRegisterFormProps {
  contentId: string;
  stageNo: string;
  mode: 'register' | 'edit';
}

export default function StageRegisterForm({ contentId, stageNo, mode }: StageRegisterFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    image: null as File | null,
    unlockCondition: 'open' as 'open' | 'location' | 'stage',
    locationRadius: '',
    timeLimit: '',
    nfcUse: false,
    clearCondition: '',
    nfcCount: '',
    hiddenStage: false,
    subStageNo: '',
    openCondition: '',
    startButtonText: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
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
    console.log('Submit:', formData);
    router.push(`/save/content/stage/${contentId}`);
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            스테이지 {mode === 'register' ? '등록' : '수정'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            메인 콘텐츠: 목포의 눈물
          </Typography>
          <Typography variant="body2" color="text.secondary">
            스테이지 No: {stageNo}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => router.push(`/save/content/stage/${contentId}`)}
        >
          스테이지 관리로 돌아가기
        </Button>
      </Box>

      {/* 탭 */}
      <Card sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="기본 정보" />
          <Tab label="힌트 설정" />
          <Tab label="퍼즐 설정" />
          <Tab label="해금 설정" />
        </Tabs>
      </Card>

      <Card sx={{ boxShadow: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            {/* 기본 정보 탭 */}
            {activeTab === 0 && (
              <Box>
                {/* 스테이지 타이틀 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    스테이지 타이틀
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="※ 스테이지 이름을 입력하세요 ex) 목포의 눈물"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
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

                {/* 위치 등록 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    위치 등록
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

                {/* 스테이지 해금 조건 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    스테이지 해금 조건
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={formData.unlockCondition}
                      onChange={(e) => setFormData({ ...formData, unlockCondition: e.target.value as 'open' | 'location' | 'stage' })}
                    >
                      <FormControlLabel value="open" control={<Radio />} label="오픈" />
                      <FormControlLabel value="location" control={<Radio />} label="위치 반경" />
                      <FormControlLabel value="stage" control={<Radio />} label="스테이지 완료" />
                    </RadioGroup>
                  </FormControl>
                  {formData.unlockCondition === 'location' && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        type="number"
                        placeholder="반경 (m)"
                        value={formData.locationRadius}
                        onChange={(e) => setFormData({ ...formData, locationRadius: e.target.value })}
                        sx={{ width: 200 }}
                      />
                    </Box>
                  )}
                </Box>

                {/* 스테이지 이미지 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    스테이지 등록 이미지
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'block', marginBottom: '8px' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    ※ 가로 사이즈 1080
                  </Typography>
                </Box>

                {/* 스테이지 제한 시간 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    스테이지 제한 시간
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                      placeholder="없음"
                      sx={{ width: 150 }}
                    />
                    <Typography>분</Typography>
                  </Box>
                </Box>

                {/* NFC 사용 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    NFC 사용
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={formData.nfcUse ? 'Y' : 'N'}
                      onChange={(e) => setFormData({ ...formData, nfcUse: e.target.value === 'Y' })}
                    >
                      <FormControlLabel value="Y" control={<Radio />} label="Y" />
                      <FormControlLabel value="N" control={<Radio />} label="N" />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* 스테이지 클리어 조건 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    스테이지 클리어 조건
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      type="number"
                      value={formData.clearCondition}
                      onChange={(e) => setFormData({ ...formData, clearCondition: e.target.value })}
                      sx={{ width: 150 }}
                    />
                    <Typography>분 이내</Typography>
                    <Typography>NFC</Typography>
                    <TextField
                      type="number"
                      value={formData.nfcCount}
                      onChange={(e) => setFormData({ ...formData, nfcCount: e.target.value })}
                      sx={{ width: 150 }}
                    />
                    <Typography>개 태그</Typography>
                  </Box>
                </Box>

                {/* 시작 버튼 텍스트 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    시작 버튼 텍스트
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="탐험 시작하기"
                    value={formData.startButtonText}
                    onChange={(e) => setFormData({ ...formData, startButtonText: e.target.value })}
                  />
                </Box>
              </Box>
            )}

            {/* 힌트 설정 탭 */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6">힌트 설정</Typography>
                <Typography color="text.secondary">힌트 설정 기능은 추후 구현 예정</Typography>
              </Box>
            )}

            {/* 퍼즐 설정 탭 */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6">퍼즐 설정</Typography>
                <Typography color="text.secondary">퍼즐 설정 기능은 추후 구현 예정</Typography>
              </Box>
            )}

            {/* 해금 설정 탭 */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6">해금 설정</Typography>
                <Typography color="text.secondary">해금 설정 기능은 추후 구현 예정</Typography>
              </Box>
            )}

            {/* 버튼 */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 3, mt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
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
                {activeTab === 3 ? '저장' : '계속'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}