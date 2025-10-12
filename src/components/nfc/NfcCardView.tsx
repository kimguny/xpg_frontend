// src/components/nfc/NfcCardView.tsx
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

// 임시 데이터 타입
interface NfcTag {
  id: number;
  name: string;
  location: string;
  udid: string;
  action: string;
  cooldown: number;
  points: number;
  isActive: boolean;
}

interface NfcCardViewProps {
  data: NfcTag[];
  onDelete: (id: number) => void;
}

export default function NfcCardView({ data, onDelete }: NfcCardViewProps) {
  const router = useRouter();

  const handleEdit = (id: number) => {
    router.push(`/save/nfc/manage/${id}/edit`);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {data.map((tag) => (
        <Card key={tag.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' }, boxShadow: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{tag.name}</Typography>
            <Typography variant="body2" color="text.secondary">UDID: {tag.udid}</Typography>
            <Typography variant="body2" color="text.secondary">위치: {tag.location}</Typography>
            <Typography variant="body2" color="text.secondary">쿨타임: {tag.cooldown}초</Typography>
            <Typography variant="body2" color="text.secondary">포인트: {tag.points}</Typography>
            <Typography variant="body2" color="text.secondary">액션: {tag.action}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <FormControlLabel
                control={<Switch defaultChecked={tag.isActive} />}
                label={tag.isActive ? '활성' : '비활성'}
              />
              <Box>
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