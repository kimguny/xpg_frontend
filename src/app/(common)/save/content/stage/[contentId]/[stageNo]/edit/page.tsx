import StageRegisterForm from '@/components/content/StageRegisterForm';

export default function StageEditPage({ 
  params 
}: { 
  params: { contentId: string; stageNo: string } 
}) {
  return <StageRegisterForm contentId={params.contentId} stageNo={params.stageNo} mode="edit" />;
}