// src/components/events/EventRegisterForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Add } from '@mui/icons-material';

interface NfcItem {
  id: number;
  name: string;
  location: string;
}

const eventRulesDefaultValue = `2. 점령방법
- 주최측에서총50개의NFC 점령지를설치해둠
- 게임이시작되면그중일부(3·5·7·9개등홀수개)만목표점령지로활성화됨
- 참가자는앱에서활성화된목표점령지위치힌트를확인가능
- 스마트폰으로NFC 태그를찍으면점령성공
- 먼저태그한팀이해당점령지를차지(이후탈취불가)
- 점령시즉시포인트획득(추가점수없음)
3. 승리조건
- 게임종료시더많은목표점령지를차지한팀이승리
- 한팀이과반수이상점령하면즉시게임종료, 해당팀승리
- 만약종료시동률이발생하면, 현재스코어에먼저도달한팀이승리
4. 유의사항
- 점령현황은앱에서확인가능
- 이미점령된기지도방문할수있으나, 점령변경은불가능
- 불공정플레이적발시운영자가실격처리가능`;

export default function EventRegisterForm() {
  const router = useRouter();
  const [registeredNfcs, setRegisteredNfcs] = useState<NfcItem[]>([]);

  const handleAddNfc = () => {
    const newNfcId = registeredNfcs.length + 1;
    setRegisteredNfcs(prev => [
      ...prev,
      { id: newNfcId, name: `목포시_NFC_${newNfcId}`, location: `목포시 산정동 ${newNfcId}` }
    ]);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        새 이벤트 등록
      </Typography>

      <Card sx={{ p: 3 }}>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>이벤트 종류 선택</FormLabel>
            <RadioGroup row defaultValue="domination">
              <FormControlLabel value="domination" control={<Radio />} label="점령전" />
              <FormControlLabel value="cops_and_robbers" control={<Radio />} label="경찰과 도둑" />
              <FormControlLabel value="eco_challenge" control={<Radio />} label="환경 챌린지" />
            </RadioGroup>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField label="팀 인원 설정" type="number" InputProps={{ inputProps: { min: 3, max: 5 } }} sx={{ width: 200 }}/>
            <Typography variant="body2" color="text.secondary">* 각 팀당 3~5명 설정 가능</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField label="게임시간설정" type="number" InputProps={{ inputProps: { max: 30 } }} sx={{ width: 200 }}/>
              <Typography variant="body2" color="text.secondary">* 한 게임당 최대 30분</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField label="게임 획득 포인트" type="number" sx={{ width: 200 }}/>
            <Typography variant="body2" color="text.secondary">* 점령전 획득시 포인트 설정</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>NFC 등록 여부</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleAddNfc} sx={{ mb: 2 }}>
              NFC 추가
            </Button>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>NFC 명</TableCell>
                    <TableCell>위치</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registeredNfcs.map(nfc => (
                    <TableRow key={nfc.id}><TableCell>{nfc.name}</TableCell><TableCell>{nfc.location}</TableCell></TableRow>
                  ))}
                  {registeredNfcs.length === 0 && (
                    <TableRow><TableCell colSpan={2} align="center">등록된 NFC가 없습니다.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>이벤트 규칙 도움말</Typography>
              <Typography variant="body2" color="text.secondary">* 게임 시작 시 팝업 형태로 게임 규칙을 사용자에게 표시해 줄 내용을 입력</Typography>
            </Box>
            <TextField multiline rows={12} defaultValue={eventRulesDefaultValue} fullWidth />
          </Box>

        </Box>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button variant="outlined" size="large">미리보기</Button>
        <Button variant="contained" size="large">저장</Button>
      </Box>
    </Box>
  );
}