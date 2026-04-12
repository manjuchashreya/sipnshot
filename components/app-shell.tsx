"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { NavLink } from "@/components/nav-link";

export function AppShell({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <div className={`shell ${isMenuOpen ? "shell--menu-open" : ""}`}>
      <div className="shell__inner">
        <header className="topbar">
          <div className="topbar__main">
            <div className="brand">
              <Image
                src="/logo.png"
                alt="sip'n shot logo"
                width={40}
                height={50}
                className="brand__logo"
              />
              <div className="brand__text">
                <span className="brand__eyebrow">AI Party Drink Guide</span>
                <h1>sip&apos;n shot</h1>
              </div>
            </div>

            <button
              className={`menu-toggle ${isMenuOpen ? "menu-toggle--open" : ""}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="menu-toggle__icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>

          <p className="brand__desc">Tell us about the party. We suggest what to buy, what to drink, and how to pace it.</p>

          <nav className={`nav-dropdown ${isMenuOpen ? "nav-dropdown--open" : ""}`}>
            <NavLink href="/" label="Start Here" />
            <NavLink href="/contacts" label="My Taste" />
            <NavLink href="/drafts" label="Party Setup" />
            <NavLink href="/itinerary" label="Party Plan" />
            <NavLink href="/shopping" label="Shopping List" />
            <NavLink href="/settings" label="Local Picks" />
            <NavLink href="/guest" label="Guest RSVP" />
          </nav>
        </header>

        {isMenuOpen && <div className="nav-overlay" onClick={() => setIsMenuOpen(false)} />}

        <main className="content">
          {children}
        </main>

        <footer suppressHydrationWarning style={{ marginTop: "40px", padding: "20px", textAlign: "center", fontSize: "12px", color: "var(--text-soft)", borderTop: "1px solid var(--border)" }}>
          <p>
            <strong>Disclaimer:</strong> sip&apos;n shot does not promote the excessive or irresponsible consumption of alcohol.
            This application is designed solely to provide responsible pacing guidance, budget estimations, and safe environment suggestions for your events. Please drink responsibly.
          </p>
        </footer>
      </div>
    </div>
  );
}
