'use client'; 

import StageRegisterForm from '@/components/content/StageRegisterForm';
import { use } from 'react'; 

// 1. 인터페이스의 파라미터 이름을 폴더명과 일치하는 'stageId'로 수정
interface StageRegisterPageProps {
  params: Promise<{ contentId: string; stageId: string }>;
}

export default function StageRegisterPage({ params }: StageRegisterPageProps) {
  // 2. 'stageNo' 대신 'stageId'를 구조분해합니다. (이 'stageId'가 "1", "2" 같은 스테이지 번호입니다)
  const { contentId, stageId } = use(params);

  // 3. StageRegisterForm의 'stageNo' prop에 URL에서 받은 'stageId' 값을 전달합니다.
  return <StageRegisterForm contentId={contentId} stageNo={stageId} />;
}