import ActivityDetailsClient from "./ActivityDetailsClient";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface PageProps {
  params: {
    id: string;
  };
}

export default function ActivityDetailsPage({ params }: PageProps) {
  return <ActivityDetailsClient id={params.id} />;
}
