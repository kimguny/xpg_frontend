import StageRegisterForm from '@/components/content/StageRegisterForm';

type StageEditPageProps = {
  params: Promise<{ contentId: string; stageNo: string }>;
};

export default async function StageEditPage({ params }: StageEditPageProps) {
  const { contentId, stageNo } = await params;

  return <StageRegisterForm contentId={contentId} stageNo={stageNo} mode="edit" />;
}