import EditorPageClient from "./EditorPageClient";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  return <EditorPageClient type={type} id={id} />;
}
