// 'use client';

// import { Box, TextField, Typography } from '@mui/material';
// import { Controller, Control } from 'react-hook-form';
// import { FullHintFormData } from '../HintSettingsTab';

// interface ArCameraFormProps {
//   control: Control<FullHintFormData>;
// }

// export default function ArCameraForm({ control }: ArCameraFormProps) {
//   return (
//     <Box>
//       <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>상단 이미지 등록</Typography>
//       <Controller name="arCamera.imageUrl" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="이미지 URL" fullWidth sx={{ mb: 2 }} placeholder="https://..." />} />
//     </Box>
//   );
// }