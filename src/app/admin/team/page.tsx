import Link from "next/link";
import { readAllUsers } from "@/lib/user-store";
import { getSessionUser } from "@/lib/session";
import TeamManager from "./TeamManager";

export const dynamic = "force-dynamic";

const OWNER_EMAIL = "dossoumaxime888@gmail.com";

export default async function TeamPage() {
  const me = await getSessionUser();
  const allUsers = await readAllUsers();
  const users = me?.email === OWNER_EMAIL
    ? allUsers
    : allUsers.filter((u) => u.email !== OWNER_EMAIL);

  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <div className="page-title-box d-md-flex justify-content-md-between align-items-center">
            <h4 className="page-title">Gestion de l'équipe</h4>
            <div>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link href="/admin">Admin</Link></li>
                <li className="breadcrumb-item active">Équipe</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      <TeamManager initialUsers={users} />
    </>
  );
}
