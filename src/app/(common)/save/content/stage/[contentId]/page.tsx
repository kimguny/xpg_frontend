import StageManageList from '@/components/content/StageManageList';

type StageManagePageProps = {
  params: Promise<{ contentId: string }>;
};

export default async function StageManagePage({ params }: StageManagePageProps) {
  const { contentId } = await params;

  return <StageManageList contentId={contentId} />;
}