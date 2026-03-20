import CaisseManager from "./CaisseManager";

export default function CaissePage() {
  return (
    <div className="container-xxl">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">Caisse</h4>
          </div>
        </div>
      </div>
      <CaisseManager />
    </div>
  );
}
