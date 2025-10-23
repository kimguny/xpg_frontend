'use client'; // 'use client' 추가

import StageRegisterForm from '@/components/content/StageRegisterForm';
import { use } from 'react'; // 'use' 훅 import 추가

// props 인터페이스 이름 변경 및 stageId 추가
interface StageEditPageProps {
  params: Promise<{ contentId: string; stageNo: string; stageId: string }>; // stageId 추가 필요 -> Next.js 라우팅 규칙 확인 필요
}

export default function StageEditPage({ params }: StageEditPageProps) {
  // use() 훅으로 params 값 추출
  const { contentId, stageNo, stageId } = use(params); // stageId 추출 추가 -> 라우팅 규칙 확인 필요

  // StageRegisterForm 호출 시 mode prop 제거하고 stageId 전달
  return <StageRegisterForm contentId={contentId} stageNo={stageNo} stageId={stageId} />;
}