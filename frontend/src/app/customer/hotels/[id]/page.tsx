import HotelDetailsClient from "./HotelDetailsClient";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface PageProps {
  params: {
    id: string;
  };
}

export default function HotelDetailsPage({ params }: PageProps) {
  return <HotelDetailsClient id={params.id} />;
}
