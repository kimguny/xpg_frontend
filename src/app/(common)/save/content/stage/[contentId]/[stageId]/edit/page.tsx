'use client';

import StageRegisterForm from '@/components/content/StageRegisterForm';
import { use } from 'react';

// params가 stageId를 받도록 인터페이스를 수정합니다.
interface StageEditPageProps {
  params: Promise<{ 
    contentId: string; 
    stageId: string; 
  }>;
}

export default function StageEditPage({ params }: StageEditPageProps) {
  // params로부터 stageNo 대신 stageId를 추출합니다.
  const { contentId, stageId } = use(params);

  // StageRegisterForm에 stageId를 prop으로 전달하고,
  // 더 이상 필요 없는 stageNo와 mode prop은 제거합니다.
  return <StageRegisterForm contentId={contentId} stageId={stageId} />;
}