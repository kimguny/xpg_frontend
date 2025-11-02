'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip, // [1. 추가] Chip 컴포넌트 import
} from '@mui/material';
import { useRouter } from 'next/navigation';
// [2. 수정] admin.ts에서 실제 NfcTag 타입을 import
import { NfcTag } from '@/lib/api/admin'; 

// [3. 수정] Props 타입이 실제 NfcTag 배열을 받도록 하고, id 타입을 string으로 변경
interface NfcTableViewProps {
  data: NfcTag[];
  onDelete: (id: string) => void;
}

export default function NfcTableView({ data, onDelete }: NfcTableViewProps) {
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
    <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            {/* [6. 수정] 컬럼명 변경 (id -> tag_name, name -> category 등) */}
            <TableCell sx={{ fontWeight: 600 }}>NFC 명칭 (태그명)</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>카테고리</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>위치 (주소)</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>UDID</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>액션</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>쿨타임</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>포인트</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>관리</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* [7. 수정] 실제 NfcTag 속성 이름으로 교체 */}
          {data.map((tag) => (
            <TableRow key={tag.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
              <TableCell>{tag.tag_name}</TableCell>
              <TableCell>{tag.category || '-'}</TableCell>
              <TableCell>{tag.address || tag.floor_location || '-'}</TableCell>
              <TableCell>{tag.udid}</TableCell>
              <TableCell>{getActionLabel(tag)}</TableCell>
              <TableCell>{tag.cooldown_sec}초</TableCell>
              <TableCell>{tag.point_reward}</TableCell>
              <TableCell>
                <Chip
                  label={tag.is_active ? '활성' : '비활성'}
                  color={tag.is_active ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => handleEdit(tag.id)}>수정</Button>
                <Button variant="outlined" size="small" color="error" onClick={() => onDelete(tag.id)}>삭제</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}