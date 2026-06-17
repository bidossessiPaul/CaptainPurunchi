"use client";

import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", key: "accueil" },
  { href: "/menu", label: "Menu", key: "menu" },
  { href: "/galerie", label: "Galerie", key: "galerie" },
  { href: "/chambres", label: "Chambres", key: "chambres" },
  { href: "/evenements", label: "\u00c9v\u00e9nements", key: "evenements" },
  { href: "/reservation", label: "R\u00e9servation", key: "reservation" },
  { href: "/a-propos", label: "\u00c0 Propos", key: "a-propos" },
  { href: "/contact", label: "Contact", key: "contact" },
];

export default function Navbar({ activePage }: { activePage?: string }) {
  return (
    <div id="site-header">
      <header id="header" className="header-block-top" suppressHydrationWarning>
        <div className="container">
          <div className="row">
            <div className="main-menu">
              <nav className="navbar navbar-default" id="mainNav">
                <div className="navbar-header">
                  <button
                    type="button"
                    className="navbar-toggle collapsed"
                    data-toggle="collapse"
                    data-target="#navbar"
                    aria-expanded="false"
                    aria-controls="navbar"
                  >
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                  <div className="logo">
                    <Link
                      className="navbar-brand js-scroll-trigger logo-header"
                      href="/"
                    >
                      <img
                        className="logo-default"
                        src="/images%20captain/logo%20pour%20fond%20noir.png"
                        alt="Captain Purunchi"
                      />
                      <img
                        className="logo-scrolled"
                        src="/images%20captain/logo%20normal.png"
                        alt="Captain Purunchi"
                      />
                    </Link>
                  </div>
                </div>
                <div id="navbar" className="navbar-collapse collapse">
                  <ul className="nav navbar-nav navbar-right">
                    {NAV_ITEMS.map((item) => (
                      <li
                        key={item.key}
                        className={activePage === item.key ? "active" : undefined}
                      >
                        <Link href={item.href}>{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
