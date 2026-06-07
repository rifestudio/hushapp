import { AuthPage } from "@/components/AuthPage";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  redirect("/");
  return <AuthPage mode="register" />;
}
