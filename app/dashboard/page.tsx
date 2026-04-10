import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = await currentUser();
  const cookieStore = await cookies();
  const spotifyConnected = !!cookieStore.get("spotify_access_token")?.value;

  return (
    <DashboardClient
      userName={user?.firstName || user?.username || "mystery listener"}
      userImage={user?.imageUrl}
      spotifyConnected={spotifyConnected}
    />
  );
}
