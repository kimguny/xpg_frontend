// src/app/(common)/save/nfc/manage/[nfcId]/edit/page.tsx
import NfcRegisterForm from '@/components/nfc/NfcRegisterForm';
import React from 'react';

// [1. 수정] Props 타입이 params를 직접 받도록 수정
interface EditPageProps {
  params: {
    nfcId: string;
  };
}

// [2. 수정] async/await 제거 (데이터 페칭은 폼 컴포넌트에서)
export default function NfcEditPage({ params }: EditPageProps) {
  
  // [3. 수정] nfcId prop을 폼 컴포넌트로 전달
  return <NfcRegisterForm mode="edit" nfcId={params.nfcId} />;
}