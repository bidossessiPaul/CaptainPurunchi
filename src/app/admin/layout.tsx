import type { Metadata } from "next";
import AdminShell from "./AdminShell";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin - Captain Purunchi",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/admin-assets/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/admin-assets/css/icons.min.css" />
      <link rel="stylesheet" href="/admin-assets/css/app.min.css" />
      <AdminShell>{children}</AdminShell>
    </>
  );
}

