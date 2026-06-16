import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Dashboard from "./Dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return (
    <Dashboard
      user={{ id: user.id, name: user.name, email: user.email, preferredModel: user.preferredModel ?? null }}
    />
  );
}
