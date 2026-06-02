import { ChatClient } from "@/components/ChatClient";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = await params;
  return <ChatClient partnerId={partnerId} />;
}
