import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { SignOut } from "@/components/logout-button";
import DashboardStats from "@/components/dashboard/dashboard-start";
export default async function Page() {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  return (
    <div className="container">
      <DashboardStats />
      {/* <pre>{JSON.stringify(session, null, 2)}</pre>
      <SignOut /> */}
    </div>
  );
}
