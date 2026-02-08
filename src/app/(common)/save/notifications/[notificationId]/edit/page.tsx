// src/app/(common)/save/notifications/[notificationId]/edit/page.tsx
'use client';

import NotificationRegisterForm from '@/components/notifications/NotificationRegisterForm';
import React from 'react';
import { use } from 'react';

interface NotificationEditPageProps {
  params: Promise<{ notificationId: string }>;
}

export default function NotificationEditPage({ params }: NotificationEditPageProps) {
  const { notificationId } = use(params);
  
  return <NotificationRegisterForm mode="edit" notificationId={notificationId} />;
}