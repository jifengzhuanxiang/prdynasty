"use client";

import { useState } from "react";

const NAV_LINKS = [
  { href: "#top", label: "招新首页" },
  { href: "#groups", label: "三个分组" },
  { href: "#benefits", label: "加入收获" },
  { href: "#stories", label: "真实日常" },
  { href: "#faq", label: "常见问题" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="menu-lines" aria-hidden="true" />
        <span className="sr-only">{open ? "关闭导航菜单" : "打开导航菜单"}</span>
      </button>
      {open ? (
        <nav
          className="mobile-nav-panel"
          id="mobile-nav-panel"
          aria-label="移动端导航"
        >
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a
            className="mobile-nav-cta"
            href="#join"
            onClick={() => setOpen(false)}
          >
            立即加入
          </a>
        </nav>
      ) : null}
    </div>
  );
}
