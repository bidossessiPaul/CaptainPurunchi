import GalleryManager from "./GalleryManager";

export default function GalleryAdminPage() {
  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <div className="page-title-box d-md-flex justify-content-md-between align-items-center">
            <h4 className="page-title">Galerie</h4>
            <div>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Admin</a></li>
                <li className="breadcrumb-item active">Galerie</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <GalleryManager />
    </>
  );
}
