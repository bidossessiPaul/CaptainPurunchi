import Link from "next/link";
import ProfileManager from "./ProfileManager";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <div className="page-title-box d-md-flex justify-content-md-between align-items-center">
            <h4 className="page-title">Mon profil</h4>
            <div>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link href="/admin">Admin</Link></li>
                <li className="breadcrumb-item active">Profil</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      <ProfileManager />
    </>
  );
}
