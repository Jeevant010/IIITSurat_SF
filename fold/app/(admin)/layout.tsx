import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Security check - only ADMIN users can access admin routes
  const user = await getCurrentUser();

  if (!user) {
    // Not logged in - redirect to login
    redirect(
      "/login?error=unauthorized&message=Please%20login%20to%20access%20admin%20panel",
    );
  }

  if (user.role !== "ADMIN") {
    // Logged in but not admin - redirect to home with error
    redirect(
      "/?error=forbidden&message=You%20do%20not%20have%20admin%20privileges",
    );
  }

  return <>{children}</>;
}
