import Layout from "@/components/layout";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  // 사이드바가 있는 레이아웃으로 한번 더 감쌈
  return <Layout>{children}</Layout>;
}