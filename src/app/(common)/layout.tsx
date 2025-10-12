import LayoutComponent from "@/components/layout";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  // 사이드바가 있는 레이아웃으로 한번 더 감쌈
  return <LayoutComponent>{children}</LayoutComponent>;
}