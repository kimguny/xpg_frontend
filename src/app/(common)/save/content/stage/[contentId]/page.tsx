import StageManageList from '@/components/content/StageManageList';

export default function StageManagePage({ params }: { params: { contentId: string } }) {
  return <StageManageList contentId={params.contentId} />;
}