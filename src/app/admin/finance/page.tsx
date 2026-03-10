import FinanceManager from "./FinanceManager";

export default function FinancePage() {
  return (
    <div className="container-xxl">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">Comptabilité & Finances</h4>
          </div>
        </div>
      </div>
      <FinanceManager />
    </div>
  );
}
