import StoreRegisterForm from '@/components/stores/StoreRegisterForm';
import React from 'react';

interface EditPageProps {
  params: Promise<{
    storeId: string;
  }>;
}

export default async function StoreEditPage({ params }: EditPageProps) {
  const resolvedParams = await params;

  return <StoreRegisterForm mode="edit" storeId={resolvedParams.storeId} />;
}