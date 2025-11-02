'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useRouter } from 'next/navigation';
// [1. 수정] admin.ts에서 실제 NfcTag 타입을 import
import { NfcTag } from '@/lib/api/admin';

// [2. 수정] 임시 데이터 타입(NfcTag) 정의 삭제

// [3. 수정] Props 타입이 실제 NfcTag 배열을 받도록 하고, id 타입을 string으로 변경
interface NfcCardViewProps {
  data: NfcTag[];
  onDelete: (id: string) => void;
}

export default function NfcCardView({ data, onDelete }: NfcCardViewProps) {
  const router = useRouter();

  // [4. 수정] id 타입을 string으로 변경
  const handleEdit = (id: string) => {
    router.push(`/save/nfc/manage/${id}/edit`);
  };

  // [5. 추가] 액션 타입을 한글로 변환하는 헬퍼 함수
  const getActionLabel = (tag: NfcTag) => {
    if (tag.link_url) return 'URL 이동';
    if (tag.media_url) return '미디어 파일';
    if (tag.tap_message) return '텍스트 메시지';
    return '-';
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {/* [6. 수정] 실제 NfcTag 속성 이름으로 교체 */}
      {data.map((tag) => (
        <Card key={tag.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' }, boxShadow: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{tag.tag_name}</Typography>
            <Typography variant="body2" color="text.secondary">UDID: {tag.udid}</Typography>
            <Typography variant="body2" color="text.secondary">위치: {tag.address || tag.floor_location || '-'}</Typography>
            <Typography variant="body2" color="text.secondary">쿨타임: {tag.cooldown_sec}초</Typography>
            <Typography variant="body2" color="text.secondary">포인트: {tag.point_reward}</Typography>
            <Typography variant="body2" color="text.secondary">액션: {getActionLabel(tag)}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <FormControlLabel
                // [7. 수정] Switch가 tag.is_active 값을 표시하도록 (클릭 비활성화)
                control={<Switch checked={tag.is_active} readOnly />}
                label={tag.is_active ? '활성' : '비활성'}
              />
              <Box>
                {/* [8. 수정] id 타입을 string으로 변경 */}
                <Button size="small" sx={{ mr: 1 }} onClick={() => handleEdit(tag.id)}>수정</Button>
                <Button size="small" color="error" onClick={() => onDelete(tag.id)}>삭제</Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}