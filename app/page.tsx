import CourseApp from "@/components/course-app";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  return <CourseApp initialName={user?.fullName ?? ""} />;
}
