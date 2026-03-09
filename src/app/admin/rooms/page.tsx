import RoomsManager from "./RoomsManager";

export default function RoomsAdminPage() {
  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <div className="page-title-box d-md-flex justify-content-md-between align-items-center">
            <h4 className="page-title">Chambres</h4>
            <div>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Admin</a></li>
                <li className="breadcrumb-item active">Chambres</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <RoomsManager />
    </>
  );
}
