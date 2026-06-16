import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Login from "./login/Login";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <Login />;
}
