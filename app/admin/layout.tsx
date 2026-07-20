import { redirect } from "next/navigation";

import { AdminShell } from "@/components/layout/AdminShell";

import {
  AdminRequiredError,
  AuthenticationRequiredError,
  requireAdminUser,
} from "@/lib/auth/guards";

async function getAdminPageUser() {
  try {
    return await requireAdminUser();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/login");
    }

    if (error instanceof AdminRequiredError) {
      redirect("/unauthorized");
    }

    throw error;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminPageUser();

  return (
    <AdminShell user={user}>
      {children}
    </AdminShell>
  );
}