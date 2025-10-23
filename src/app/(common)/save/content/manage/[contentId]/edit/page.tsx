'use client';

import { use } from 'react';
import ContentRegisterForm from '@/components/content/ContentRegisterForm';
import { Box, Typography } from '@mui/material';

interface ContentEditPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

export default function ContentEditPage({ params }: ContentEditPageProps) {
  const { contentId } = use(params);

  return (
    <Box>
      <ContentRegisterForm contentId={contentId} />
    </Box>
  );
}