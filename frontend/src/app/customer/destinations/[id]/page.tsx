import DestinationDetailsClient from "./DestinationDetailsClient";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface PageProps {
  params: {
    id: string;
  };
}

export default function DestinationDetailsPage({ params }: PageProps) {
  return <DestinationDetailsClient id={params.id} />;
}
