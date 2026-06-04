import Link from "next/link";
import type { Room } from "@/app/types/room";

export default function Rooms({ rooms, hideTitle, grid }: { rooms: Room[]; whatsapp?: string; hideTitle?: boolean; grid?: boolean }) {
  if (rooms.length === 0) return null;

  return (
    <div id="rooms" className="rooms-section">
      <div className="container">
        {!hideTitle && (
          <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s" suppressHydrationWarning>
            <h2 className="block-title text-center">Nos Chambres</h2>
            <p className="rooms-subtitle text-center">
              Prolongez votre expérience et séjournez dans nos chambres confortables.
            </p>
          </div>
        )}

        <div className={grid ? "rooms-grid-wrapper" : "rooms-scroll-wrapper"}>
          <div className={grid ? "rooms-grid" : "rooms-scroll"}>
            {rooms.map((r) => (
              <Link key={r.id} href={`/chambres/${r.slug}`} className="room-card" style={{ textDecoration: "none" }}>
                <div className="room-card-img">
                  <img src={r.thumb} alt={r.name} />
                  <div className="room-card-price">{r.price}</div>
                </div>
                <div className="room-card-body">
                  <h3 className="room-card-title">{r.name}</h3>
                  <p className="room-card-capacity">
                    <i className="fa fa-users" aria-hidden="true"></i> {r.capacity}
                  </p>
                  <p className="room-card-desc">{r.shortDesc}</p>
                  <span className="room-card-btn">Voir détails</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
