'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useGetStages } from '@/hooks/query/useGetStages';
import { useGetContentById } from '@/hooks/query/useGetContentById'; // 콘텐츠 정보 조회를 위한 훅 추가
import { Stage } from '@/lib/api/admin';

// Props를 contentId만 받도록 수정
interface StageManageListProps {
  contentId: string;
}

export default function StageManageList({ contentId }: StageManageListProps) {
  const router = useRouter();

  // 1. 스테이지 목록과 콘텐츠 상세 정보를 각각 API로 불러옵니다.
  const { data: stages, isLoading: isLoadingStages } = useGetStages(contentId);
  const { data: content, isLoading: isLoadingContent } = useGetContentById(contentId);

  // 두 API 호출이 모두 끝나야 로딩이 완료된 것으로 간주합니다.
  const isLoading = isLoadingStages || isLoadingContent;

  const totalStages = content?.stage_count || 0;
  const contentName = content?.title || '';

  const stageSlots = Array.from({ length: totalStages }, (_, i) => i + 1);

  const displayStages = stageSlots.map(stageNumber => {
    const existingStage = stages?.find(s => s.stage_no === stageNumber.toString());

    if (existingStage) {
      return {
        ...existingStage,
        isRegistered: true,
      };
    } else {
      return {
        id: `new-${stageNumber}`,
        stage_no: stageNumber.toString(),
        title: '(미등록)',
        isRegistered: false,
        uses_nfc: false,
        is_hidden: false,
        is_open: false,
      } as Stage & { isRegistered: boolean };
    }
  });

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            스테이지 관리
          </Typography>
          {/* API로 불러온 데이터를 사용합니다. */}
          <Typography variant="body2" color="text.secondary">
            메인 콘텐츠: {contentName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            스테이지 수: {totalStages}개
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => router.push('/save/content/manage')}
        >
          콘텐츠 관리로 돌아가기
        </Button>
      </Box>

      <Card sx={{ boxShadow: 1 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            스테이지 목록
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>NO</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>스테이지 명</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>힌트 유형</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>퍼즐</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>NFC</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>서비스 상태</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center"><CircularProgress /></TableCell>
                </TableRow>
              ) : (
                displayStages.map((stage) => (
                  <TableRow key={stage.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell>{stage.stage_no}</TableCell>
                    <TableCell>{stage.title}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{stage.uses_nfc ? '사용' : '-'}</TableCell>
                    <TableCell>
                      {stage.isRegistered ? (
                        <Chip
                          label={stage.is_hidden ? '히든' : '일반'}
                          size="small"
                          color={stage.is_hidden ? 'warning' : 'default'}
                        />
                      ) : (
                        <Chip label="미등록" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {stage.isRegistered ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color={stage.is_open ? 'green' : 'text.secondary'}>
                            {stage.is_open ? '● 활성' : '○ 비활성'}
                          </Typography>
                        </Box>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {stage.isRegistered ? (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => router.push(`/save/content/stage/${contentId}/${stage.stage_no}/edit`)}
                        >
                          수정
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => router.push(`/save/content/stage/${contentId}/${stage.stage_no}/register`)}
                        >
                          등록
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}