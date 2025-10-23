'use client';

import StageManageList from '@/components/content/StageManageList';
import { use } from 'react';

interface StagePageProps {
  params: Promise<{ contentId: string }>;
}

export default function StagePage({ params }: StagePageProps) {
  const { contentId } = use(params);

  // contentId만 props로 전달합니다.
  return <StageManageList contentId={contentId} />;
}