import RavitaillementManager from "./RavitaillementManager";

export default function RavitaillementPage() {
  return (
    <div className="container-xxl">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">Ravitaillement</h4>
          </div>
        </div>
      </div>
      <RavitaillementManager />
    </div>
  );
}
