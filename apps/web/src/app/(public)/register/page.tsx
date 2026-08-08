import { redirect } from "next/navigation";

// We don't have customer registration — redirect to the account dashboard
export default function RegisterPage() {
  redirect("/account/dashboard");
}
