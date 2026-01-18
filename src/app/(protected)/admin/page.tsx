import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { SignOut } from "@/components/logout-button";
const Adminpage = async () => {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }
  if (session?.user?.role !== "ADMIN") {
    return <div>not admin</div>;
  }
  return (
    <div className="container">
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <SignOut />
    </div>
  );
};

export default Adminpage;
