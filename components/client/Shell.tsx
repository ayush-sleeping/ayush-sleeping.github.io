"use client";

// The v4 chrome around the page (documentation/design/v4-logic.js, `Component`): the fixed
// sidebar (a drawer below 1024 px), the mobile top bar, the scroll-spy with its sliding indicator,
// the ⌘K search palette, the scroll progress bar, the back-to-top ring and the toast. Everything
// here is design behaviour; the data arrives as props from app/page.tsx.
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { RESUME, asset } from "@/lib/site";

export interface ShellLink {
  id: string;
  label: string;
}
export interface SideItem extends ShellLink {
  /** Anchor when it differs from the id (Career → #experience). */
  href?: string;
  children?: ShellLink[];
}
export interface ShellSocial {
  label: string;
  href: string;
  icon_class?: string;
}
export interface PaletteProject {
  title: string;
  anchor: string;
  category: string;
}

interface Props {
  brand: string;
  avatar: string;
  ctaLabel: string;
  email: string;
  /** The five header-level sections, for the footer-style `active` state. */
  nav: ShellLink[];
  /** The sidebar tree. */
  sideList: SideItem[];
  /** Every id the sidebar can highlight, in page order (`SPY()` in the design). */
  spyIds: string[];
  /** Sections for the palette, in page order. */
  paletteSections: ShellLink[];
  projects: PaletteProject[];
  socials: ShellSocial[];
  children: ReactNode;
}

interface PaletteItem {
  group: string;
  label: string;
  hint: string;
  icon: string;
  act: () => void;
}

const Brand = ({ brand, avatar, small }: { brand: string; avatar: string; small?: boolean }) => (
  <a href="#home" className="v4-brand">
    <img src={avatar} alt="" className={`v4-avatar${small ? "" : " v4-avatar-26"}`} />
    <span className="v4-brand-text">
      {brand.slice(0, 5)}
      <span className="v4-accent">{brand.slice(5)}</span>
    </span>
  </a>
);

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scrolls a section into view, honouring its scroll-margin-top, as the design's go(). */
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const off = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - off,
    behavior: reduced() ? "auto" : "smooth",
  });
}

/** Copies text and shows a toast, with the design's textarea fallback. */
export function copyText(text: string, message: string) {
  const done = () => showToast(message);
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch {
      showToast(text);
    }
    ta.remove();
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, fallback);
  else fallback();
}

/** Any component can raise the toast: Motion (copied links), CertScroller. */
export const showToast = (message: string) =>
  window.dispatchEvent(new CustomEvent("v4:toast", { detail: message }));

export default function Shell({
  brand,
  avatar,
  ctaLabel,
  email,
  nav,
  sideList,
  spyIds,
  paletteSections,
  projects,
  socials,
  children,
}: Readonly<Props>) {
  const [drawer, setDrawerState] = useState(false);
  const [activeItem, setActiveItem] = useState("home");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [kOpen, setKOpen] = useState(false);
  const [kQuery, setKQuery] = useState("");
  const [kSel, setKSel] = useState(0);
  const [toast, setToast] = useState("");
  const [toTop, setToTop] = useState(false);
  const [kbdHint, setKbdHint] = useState("Ctrl K");
  const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const asideRef = useRef<HTMLElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const kInputRef = useRef<HTMLInputElement>(null);
  const kListRef = useRef<HTMLDivElement>(null);

  const setDrawer = useCallback((v: boolean) => {
    setDrawerState(v);
    document.body.style.overflow = v ? "hidden" : "";
  }, []);
  const openK = useCallback(() => {
    setKOpen(true);
    setKQuery("");
    setKSel(0);
    setDrawer(false);
    document.body.style.overflow = "hidden";
  }, [setDrawer]);
  const closeK = useCallback(() => {
    setKOpen(false);
    document.body.style.overflow = "";
  }, []);

  // ---- the palette's entries
  const allItems = useCallback((): PaletteItem[] => {
    const go = (id: string) => () => scrollToId(id);
    const openUrl = (u: string) => () => window.open(u, "_blank", "noopener");
    const social = (id: string) => socials.find((s) => s.label.toLowerCase() === id)?.href ?? "#";
    const handle = (href: string) => href.replace(/\/$/, "").split("/").pop() ?? "";
    return [
      ...paletteSections.map((s) => ({
        group: "Sections",
        label: s.label,
        hint: "#" + s.id,
        icon: "fa-solid fa-hashtag",
        act: go(s.id),
      })),
      ...projects.map((p) => ({
        group: "Projects",
        label: p.title,
        hint: p.category,
        icon: "fa-regular fa-folder",
        act: go(p.anchor),
      })),
      {
        group: "Actions",
        label: "Copy email address",
        hint: email,
        icon: "fa-regular fa-copy",
        act: () => copyText(email, "Email copied"),
      },
      {
        group: "Actions",
        label: "Download resume",
        hint: "PDF",
        icon: "fa-solid fa-file-arrow-down",
        act: () => {
          const a = document.createElement("a");
          a.href = asset(RESUME.path);
          a.download = RESUME.filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
        },
      },
      {
        group: "Actions",
        label: "Open GitHub",
        hint: handle(social("github")),
        icon: "fa-brands fa-github",
        act: openUrl(social("github")),
      },
      {
        group: "Actions",
        label: "Open LinkedIn",
        hint: handle(social("linkedin")),
        icon: "fa-brands fa-linkedin-in",
        act: openUrl(social("linkedin")),
      },
      {
        group: "Actions",
        label: "Open Twitter / X",
        hint: "@" + handle(social("twitter")),
        icon: "fa-brands fa-x-twitter",
        act: openUrl(social("twitter")),
      },
    ];
  }, [email, paletteSections, projects, socials]);

  const filtered = useCallback(() => {
    const q = kQuery.trim().toLowerCase();
    const all = allItems();
    if (!q) return all;
    return all.filter((i) => `${i.label} ${i.hint} ${i.group}`.toLowerCase().includes(q));
  }, [allItems, kQuery]);

  const runK = useCallback(
    (it: PaletteItem) => {
      closeK();
      window.setTimeout(it.act, 40);
    },
    [closeK],
  );

  // ---- the sliding indicator behind the active sidebar row (design: _placeInd)
  const placeInd = useCallback(() => {
    const aside = asideRef.current;
    if (!aside) return;
    const row = aside.querySelector<HTMLElement>('[data-row][data-active="true"]');
    const sc = (row?.closest<HTMLElement>("[data-scroll]") ?? aside) as HTMLElement;
    if (getComputedStyle(sc).position === "static") sc.style.position = "relative";
    let ind = sc.querySelector<HTMLElement>(":scope > [data-ind]");
    if (!ind) {
      ind = document.createElement("div");
      ind.setAttribute("data-ind", "");
      sc.prepend(ind);
      aside.setAttribute("data-has-ind", "");
    }
    aside.querySelectorAll<HTMLElement>("[data-ind]").forEach((o) => {
      if (o !== ind) o.style.opacity = "0";
    });
    if (!row) {
      ind.style.opacity = "0";
      return;
    }
    const top = row.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
    const left = row.getBoundingClientRect().left - sc.getBoundingClientRect().left;
    Object.assign(ind.style, {
      opacity: "1",
      left: `${left}px`,
      right: "auto",
      width: `${row.offsetWidth}px`,
      height: `${row.offsetHeight}px`,
      transform: `translateY(${top}px)`,
      top: "0",
    });
  }, []);

  useEffect(() => {
    placeInd();
    const t = window.setTimeout(placeInd, 220);
    return () => window.clearTimeout(t);
  });

  // ---- scroll: spy, progress bar, ring, back-to-top
  useEffect(() => {
    const onScroll = () => {
      let item = "home";
      for (const id of spyIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) item = id;
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        item = spyIds[spyIds.length - 1];
      }
      setActiveItem((prev) => (prev === item ? prev : item));

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(150.8 * (1 - p));
      const show = window.scrollY > window.innerHeight * 0.6;
      setToTop((prev) => (prev === show ? prev : show));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", placeInd);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", placeInd);
    };
  }, [spyIds, placeInd]);

  // ---- keyboard, viewport, toast events
  useEffect(() => {
    // After hydration only: the server can't know the platform.
    const hintTimer = window.setTimeout(() => setKbdHint(isMac() ? "⌘K" : "Ctrl K"), 0);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => {
      if (mq.matches) setDrawer(false);
    };
    mq.addEventListener("change", onMq);
    const onToast = (e: Event) => {
      setToast((e as CustomEvent<string>).detail);
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(""), 1800);
    };
    window.addEventListener("v4:toast", onToast);
    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("v4:toast", onToast);
      window.clearTimeout(toastTimer.current);
      window.clearTimeout(hintTimer);
      document.body.style.overflow = "";
    };
  }, [setDrawer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = (e.key || "").toLowerCase();
      if ((e.metaKey || e.ctrlKey) && key === "k") {
        e.preventDefault();
        if (kOpen) closeK();
        else openK();
        return;
      }
      const target = e.target as HTMLElement;
      const typing =
        /input|textarea|select/i.test(target.tagName || "") || target.isContentEditable;
      if (!kOpen && e.key === "/" && !typing) {
        e.preventDefault();
        openK();
        return;
      }
      if (kOpen) {
        const list = filtered();
        const n = list.length;
        if (e.key === "Escape") {
          e.preventDefault();
          closeK();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setKSel((s) => (n ? (s + 1) % n : 0));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setKSel((s) => (n ? (s - 1 + n) % n : 0));
        } else if (e.key === "Enter") {
          const it = list[kSel];
          if (it) {
            e.preventDefault();
            runK(it);
          }
        }
        return;
      }
      if (e.key === "Escape" && drawer) setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [kOpen, kSel, drawer, filtered, openK, closeK, runK, setDrawer]);

  // Keep the selected palette row in view and focus the input when it opens.
  useEffect(() => {
    if (!kOpen) return;
    kInputRef.current?.focus();
    const list = kListRef.current;
    const sel = list?.querySelector<HTMLElement>('[data-k-item][data-sel="true"]');
    if (!list || !sel) return;
    const t = sel.offsetTop;
    const b = t + sel.offsetHeight;
    if (t < list.scrollTop + 8) list.scrollTop = t - 36;
    else if (b > list.scrollTop + list.clientHeight - 8) list.scrollTop = b - list.clientHeight + 8;
  }, [kOpen, kSel, kQuery]);

  const onDrawerClick = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a[href]");
    if (a && drawer) setDrawer(false);
  };
  const drawerStr = String(drawer);
  const items = filtered();
  const groups: { label: string; items: (PaletteItem & { index: number })[] }[] = [];
  items.forEach((it, index) => {
    let g = groups.find((x) => x.label === it.group);
    if (!g) {
      g = { label: it.group, items: [] };
      groups.push(g);
    }
    g.items.push({ ...it, index });
  });

  return (
    <>
      <div data-progress="" ref={barRef}></div>

      <div data-backdrop="" data-open={drawerStr} onClick={() => setDrawer(false)}></div>
      <aside
        ref={asideRef}
        data-i="side"
        data-open={drawerStr}
        onClick={onDrawerClick}
        aria-label="Site navigation"
        className="v4-side"
      >
        <div className="v4-side-top">
          <div className="v4-brand-row">
            <Brand brand={brand} avatar={avatar} small />
          </div>
          <button
            type="button"
            data-search=""
            onClick={openK}
            aria-label="Search the portfolio"
            className="v4-search"
          >
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <span>Search</span>
            <span className="v4-kbd">{kbdHint}</span>
          </button>
          <div className="v4-rows">
            <a
              href="#home"
              data-row=""
              data-active={String(activeItem === "home")}
              className="v4-row"
            >
              <i className="fa-solid fa-book-open v4-row-icon" aria-hidden="true"></i>
              <span className="v4-row-label">Overview</span>
            </a>
            <a href={asset(RESUME.path)} download={RESUME.filename} data-row="" className="v4-row">
              <i className="fa-solid fa-file-arrow-down v4-row-icon" aria-hidden="true"></i>
              <span className="v4-row-label">Resume</span>
              <span className="v4-row-meta">PDF</span>
            </a>
          </div>
          <div className="v4-sep"></div>
        </div>

        <nav data-scroll="" className="v4-side-nav">
          <div className="v4-rows">
            {sideList.map((it) => {
              const kids = it.children ?? [];
              const inside =
                kids.some((c) => c.id === activeItem) ||
                (it.id === "projects" && activeItem === "projects");
              const isOpen = kids.length ? (open[it.id] ?? true) : false;
              const active = kids.length
                ? inside
                  ? "parent"
                  : "false"
                : String(activeItem === it.id);
              return (
                <div className="v4-group" key={it.id}>
                  <a
                    href={`#${it.href ?? it.id}`}
                    data-row=""
                    data-active={active}
                    className="v4-row"
                  >
                    <span className="v4-row-label">{it.label}</span>
                    {kids.length > 0 && (
                      <>
                        <span className="v4-row-meta">{kids.length}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpen((p) => ({ ...p, [it.id]: !isOpen }));
                          }}
                          aria-label={`Toggle ${it.label}`}
                          aria-expanded={isOpen}
                          className="v4-chev-btn"
                        >
                          <i
                            className="fa-solid fa-chevron-right"
                            data-chev=""
                            data-open={String(isOpen)}
                            aria-hidden="true"
                          ></i>
                        </button>
                      </>
                    )}
                  </a>
                  {isOpen && (
                    <div className="v4-sub-list">
                      {kids.map((c) => (
                        <a
                          key={c.id}
                          href={`#${c.id}`}
                          data-sub=""
                          data-active={String(activeItem === c.id)}
                          className="v4-sub"
                        >
                          {c.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="v4-side-foot">
          <a href="#contact" className="v4-btn">
            {ctaLabel} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </a>
          <div className="v4-social-grid">
            {socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener"
                aria-label={s.label}
                title={s.label}
                className="v4-social-cell"
              >
                <i className={s.icon_class} aria-hidden="true"></i>
              </a>
            ))}
          </div>
        </div>
      </aside>

      <div className="main-content fade-in" data-i="shift">
        <div data-topbar="" className="v4-topbar">
          <Brand brand={brand} avatar={avatar} />
          <div className="v4-topbar-actions">
            <button
              type="button"
              onClick={openK}
              aria-label="Search the portfolio"
              className="v4-icon-btn"
            >
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            </button>
            <a href="#contact" className="v4-btn-sm">
              {ctaLabel}
            </a>
            <button
              type="button"
              onClick={() => setDrawer(!drawer)}
              aria-label="Open navigation"
              aria-expanded={drawer}
              className="v4-icon-btn v4-icon-btn-lg"
            >
              <i
                className={drawer ? "fa-solid fa-xmark" : "fa-solid fa-bars"}
                aria-hidden="true"
              ></i>
            </button>
          </div>
        </div>
        {children}
      </div>

      {kOpen && (
        <div data-kmodal="" onClick={closeK} className="v4-kmodal">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            onClick={(e) => e.stopPropagation()}
            className="v4-k-box"
          >
            <div className="v4-k-head">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
              <input
                ref={kInputRef}
                value={kQuery}
                onChange={(e) => {
                  setKQuery(e.target.value);
                  setKSel(0);
                }}
                placeholder="Search sections, projects, actions…"
                aria-label="Search"
                autoComplete="off"
                spellCheck={false}
                className="v4-k-input"
              />
              <span className="v4-kbd">esc</span>
            </div>
            <div data-k-list="" ref={kListRef} className="v4-k-list">
              {groups.map((g) => (
                <div className="v4-k-group" key={g.label}>
                  <p className="v4-k-group-label">{g.label}</p>
                  {g.items.map((it) => (
                    <button
                      type="button"
                      key={`${g.label}-${it.label}`}
                      data-k-item=""
                      data-sel={String(it.index === kSel)}
                      onClick={() => runK(it)}
                      onMouseMove={() => {
                        if (kSel !== it.index) setKSel(it.index);
                      }}
                      className="v4-k-item"
                    >
                      <i className={it.icon} aria-hidden="true"></i>
                      <span>{it.label}</span>
                      <span className="v4-k-hint">{it.hint}</span>
                      <i
                        data-k-enter=""
                        className="fa-solid fa-arrow-turn-down v4-k-enter"
                        aria-hidden="true"
                      ></i>
                    </button>
                  ))}
                </div>
              ))}
              {items.length === 0 && <p className="v4-k-empty">No results for “{kQuery}”</p>}
            </div>
            <div className="v4-k-foot">
              <span>
                <span className="v4-kbd">↑</span>
                <span className="v4-kbd">↓</span>navigate
              </span>
              <span>
                <span className="v4-kbd">↵</span>open
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        data-totop=""
        data-show={String(toTop && !drawer)}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
          try {
            history.replaceState(null, "", location.pathname + location.search);
          } catch {
            /* ignore */
          }
        }}
        aria-label="Back to top"
        title="Back to top"
      >
        <svg viewBox="0 0 50 50" aria-hidden="true">
          <circle cx="25" cy="25" r="24" stroke="rgba(255,255,255,0.08)"></circle>
          <circle
            ref={ringRef}
            data-ring=""
            cx="25"
            cy="25"
            r="24"
            stroke="#5B78F6"
            strokeLinecap="round"
            strokeDasharray="150.8"
            strokeDashoffset="150.8"
          ></circle>
        </svg>
        <i className="fa-solid fa-arrow-up" aria-hidden="true"></i>
      </button>

      {toast && (
        <div data-toast="" role="status" className="v4-toast">
          <div className="v4-toast-box">
            <i className="fa-solid fa-check" aria-hidden="true"></i>
            <span>{toast}</span>
          </div>
        </div>
      )}
      {/* The five header-level ids are kept for the footer's Sections list; unused here. */}
      <span hidden data-nav-ids={nav.map((n) => n.id).join(",")}></span>
    </>
  );
}
