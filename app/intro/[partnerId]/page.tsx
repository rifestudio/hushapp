import { IntroClient } from "@/components/IntroClient";

export const dynamic = "force-dynamic";

export default async function IntroPage({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = await params;
  return <IntroClient partnerId={partnerId} />;
}
