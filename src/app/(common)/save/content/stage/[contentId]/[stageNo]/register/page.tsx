import StageRegisterForm from '@/components/content/StageRegisterForm';

type StageRegisterPageProps = {
  params: Promise<{ contentId: string; stageNo: string }>;
};

export default async function StageRegisterPage({ params }: StageRegisterPageProps) {
  const { contentId, stageNo } = await params;

  return <StageRegisterForm contentId={contentId} stageNo={stageNo} mode="register" />;
}