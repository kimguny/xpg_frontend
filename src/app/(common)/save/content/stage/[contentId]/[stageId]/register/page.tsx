'use client'; // 'use client' 추가 (use() 훅 사용 위해)

import StageRegisterForm from '@/components/content/StageRegisterForm';
import { use } from 'react'; // 'use' 훅 import 추가

// 타입을 Promise로 감싸고, props 인터페이스 이름 변경 (규칙성 위해)
interface StageRegisterPageProps {
  params: Promise<{ contentId: string; stageNo: string }>;
}

export default function StageRegisterPage({ params }: StageRegisterPageProps) {
  // use() 훅으로 params 값 추출
  const { contentId, stageNo } = use(params);

  // StageRegisterForm 호출 시 mode prop 제거
  return <StageRegisterForm contentId={contentId} stageNo={stageNo} />;
}