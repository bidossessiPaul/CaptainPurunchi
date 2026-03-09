export default function WhatsAppFloat({ whatsapp }: { whatsapp?: string }) {
  if (!whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contactez-nous sur WhatsApp"
    >
      <i className="fa fa-whatsapp"></i>
    </a>
  );
}
