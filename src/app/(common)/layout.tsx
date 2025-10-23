import LayoutComponent from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // 2. ProtectedRoute로 전체 레이아웃을 감싸줍니다.
    <ProtectedRoute>
      <LayoutComponent>{children}</LayoutComponent>
    </ProtectedRoute>
  );
}