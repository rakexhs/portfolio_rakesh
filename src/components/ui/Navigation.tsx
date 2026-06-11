"use client";

import { useState, useSyncExternalStore } from "react";
import { personal, navLinks } from "@/data/personal";

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export default function Navigation() {
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 40,
    () => false
  );
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "panel-glass" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10"
      >
        <a
          href="#top"
          className="font-display text-lg font-semibold tracking-tight text-ice transition-colors hover:text-accent"
        >
          {personal.firstName}
          <span className="text-accent">.</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="hud-label relative !text-ice transition-colors duration-300 hover:!text-accent after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <span className="hud-label hidden items-center gap-2 lg:flex">
              <span className="inline-block h-1.5 w-1.5 animate-blink rounded-full bg-accent" />
              {personal.availability}
            </span>
          </li>
        </ul>

        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-px w-6 bg-ice transition-transform duration-300 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-6 bg-ice transition-transform duration-300 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {open && (
        <div className="panel-glass border-t border-line md:hidden">
          <ul className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-display text-2xl font-medium text-ice transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
