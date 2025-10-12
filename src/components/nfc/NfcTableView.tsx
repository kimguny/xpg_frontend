// src/components/nfc/NfcTableView.tsx
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
  note: string;
}

interface NfcTableViewProps {
  data: NfcTag[];
  onDelete: (id: number) => void;
}

export default function NfcTableView({ data, onDelete }: NfcTableViewProps) {
  const router = useRouter();

  const handleEdit = (id: number) => {
    router.push(`/save/nfc/manage/${id}/edit`);
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600 }}>NO</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>NFC 명칭</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>위치</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>UDID</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>액션</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>쿨타임</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>포인트</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>비고</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>관리</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((tag) => (
            <TableRow key={tag.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
              <TableCell>{tag.id}</TableCell>
              <TableCell>{tag.name}</TableCell>
              <TableCell>{tag.location}</TableCell>
              <TableCell>{tag.udid}</TableCell>
              <TableCell>{tag.action}</TableCell>
              <TableCell>{tag.cooldown}초</TableCell>
              <TableCell>{tag.points}</TableCell>
              <TableCell>{tag.note}</TableCell>
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