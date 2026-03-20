import FacturesManager from "./FacturesManager";

export default function FacturesPage() {
  return (
    <div className="container-xxl">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">Factures</h4>
          </div>
        </div>
      </div>
      <FacturesManager />
    </div>
  );
}
