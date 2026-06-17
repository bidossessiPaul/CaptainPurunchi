import Link from "next/link";
import type { ContactInfo } from "@/app/types/contact";

export default function Footer({ contact }: { contact: ContactInfo }) {
  return (
    <footer id="footer" className="cp-footer">
      <div className="cp-footer-main">
        <div className="container">
          <div className="cp-footer-grid">
            <div className="cp-footer-col cp-footer-about">
              <img
                src="/images%20captain/logo%20pour%20fond%20noir.png"
                alt="Captain Purunchi"
                className="cp-footer-logo"
              />
              <p>
                {contact.footerDesc ||
                  "Votre escale gourmande au c\u0153ur de Cotonou. Restaurant, bar, rooftop et h\u00e9bergement pour des moments inoubliables."}
              </p>
              <div className="cp-footer-socials">
                {contact.facebook && (
                  <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <i className="fa fa-facebook"></i>
                  </a>
                )}
                {contact.instagram && (
                  <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <i className="fa fa-instagram"></i>
                  </a>
                )}
                {contact.whatsapp && (
                  <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                    <i className="fa fa-whatsapp"></i>
                  </a>
                )}
              </div>
            </div>

            <div className="cp-footer-col">
              <h4>Liens rapides</h4>
              <ul>
                <li><Link href="/">Accueil</Link></li>
                <li><Link href="/menu">Notre Menu</Link></li>
                <li><Link href="/galerie">Galerie</Link></li>
                <li><Link href="/chambres">Chambres</Link></li>
                <li><Link href="/evenements">Événements</Link></li>
                <li><Link href="/reservation">Réservation</Link></li>
                <li><Link href="/a-propos">À Propos</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>

            <div className="cp-footer-col">
              <h4>Contact</h4>
              <ul className="cp-footer-contact">
                {contact.address && (
                  <li><i className="fa fa-map-marker" aria-hidden="true"></i><span>{contact.address}</span></li>
                )}
                {contact.phone && (
                  <li><i className="fa fa-phone" aria-hidden="true"></i><span>{contact.phone}</span></li>
                )}
                {contact.email && (
                  <li><i className="fa fa-envelope" aria-hidden="true"></i><span>{contact.email}</span></li>
                )}
              </ul>
            </div>

            <div className="cp-footer-col">
              <h4>Horaires</h4>
              <ul className="cp-footer-hours">
                {contact.hours1Label && contact.hours1Value && (
                  <li><span>{contact.hours1Label}</span><span>{contact.hours1Value}</span></li>
                )}
                {contact.hours2Label && contact.hours2Value && (
                  <li><span>{contact.hours2Label}</span><span>{contact.hours2Value}</span></li>
                )}
                {contact.hours3Label && contact.hours3Value && (
                  <li><span>{contact.hours3Label}</span><span>{contact.hours3Value}</span></li>
                )}
              </ul>
              <div className="cp-footer-reviews">
                <h4 style={{ marginTop: "20px" }}>Laissez un avis</h4>
                <div className="cp-footer-socials">
                  <a href="https://g.page/r/captainpurunchi/review" target="_blank" rel="noopener noreferrer" aria-label="Avis Google" title="Avis Google">
                    <i className="fa fa-google"></i>
                  </a>
                  <a href="https://www.tripadvisor.com/UserReview" target="_blank" rel="noopener noreferrer" aria-label="Avis TripAdvisor" title="Avis TripAdvisor">
                    <i className="fa fa-tripadvisor"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="cp-footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Captain Purunchi — Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
}
