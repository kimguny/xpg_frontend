import NfcRegisterForm from '@/components/nfc/NfcRegisterForm';
import React from 'react';

interface EditPageProps {
  params: Promise<{
    nfcId: string;
  }>;
}

export default async function NfcEditPage({ params }: EditPageProps) {
  const resolvedParams = await params;
  console.log("Editing NFC Tag ID:", resolvedParams.nfcId);

  return <NfcRegisterForm mode="edit" />;
}