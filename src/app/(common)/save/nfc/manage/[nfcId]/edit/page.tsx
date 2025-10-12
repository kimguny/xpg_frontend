// src/app/(common)/save/nfc/manage/[nfcId]/edit/page.tsx
import NfcRegisterForm from '@/components/nfc/NfcRegisterForm';
import React from 'react';

interface EditPageProps {
  params: {
    nfcId: string;
  };
}

export default function NfcEditPage({ params }: EditPageProps) {
  console.log("Editing NFC Tag ID:", params.nfcId);

  return <NfcRegisterForm mode="edit" />;
}