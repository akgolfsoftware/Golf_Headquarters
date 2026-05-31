import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function GodkjenningRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/approvals/${id}`);
}
