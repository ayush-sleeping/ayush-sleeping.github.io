// Home (design: #home "Overview"): breadcrumb, name, the typed terminal line, intro, three
// buttons, then the 12-column bento. Content from profile, pages/home and stats; the card images
// and icon classes are the design's (T10).
import { getPageCopy, getProfile, getSocials, getStats, splitList } from "@/lib/data";
import { DECOR, RESUME, asset, imageSrc } from "@/lib/site";

const SERVICE_ICONS = ["fas fa-code", "fab fa-dev", "fas fa-code-branch", "fa-solid fa-terminal"];
const PROFILE_ICONS: Record<string, string> = {
  twitter: "fa-brands fa-twitter",
  linkedin: "fa-brands fa-linkedin-in",
};
// The Home cards' pictures (the sheet has no column for them; T10).
// These two are .png only (no .webp sibling), so they are used as-is.
const CARD_IMAGES = { works: "assets/img/my works.png", github: "assets/img/github3.png" };

const Texture = () => <img src={DECOR.cardBg} alt="" className="v4-card-bg" />;
const Foot = ({ label, title }: { label: string; title: string }) => (
  <div className="v4-card-foot">
    <div>
      <p className="v4-label">{label}</p>
      <h2 className="v4-card-title">{title}</h2>
    </div>
  </div>
);

export default function HomeSection() {
  const profile = getProfile();
  const home = getPageCopy("home");
  const stats = getStats();
  const socials = getSocials();
  const github = socials.find((s) => s.id === "github")?.href ?? home.github_url;
  const marquee = splitList(home.marquee_items, ",");
  const plain = (s: string) =>
    s
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  const chips = (s: string) =>
    s
      .replace(/<br\s*\/?>/gi, " ")
      .split(/\s*\+\s*/)
      .map((c) => c.trim())
      .filter(Boolean);

  return (
    <section id="home" data-screen-label="Overview">
      <div className="v4-home-wrap">
        <header className="v4-hero">
          <div className="v4-crumb">
            <span>Getting started</span>
            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
            <b>Overview</b>
          </div>
          <h1 className="v4-h1">{profile.name}</h1>
          <p data-term="" className="v4-term">
            <span className="v4-term-prompt">~ $</span>
            <span data-type="">{profile.tagline}</span>
            <span data-caret="" className="v4-caret"></span>
          </p>
          <p className="v4-intro">{profile.intro}</p>
          <div className="v4-actions">
            <a href="#contact" className="v4-btn">
              {profile.cta_label} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </a>
            <a href={asset(RESUME.path)} download={RESUME.filename} className="v4-btn-ghost">
              <i className="fa-solid fa-file-arrow-down" aria-hidden="true"></i> Download resume
            </a>
            <a href={github} target="_blank" rel="noopener" className="v4-btn-ghost">
              <i className="fab fa-github" aria-hidden="true"></i> GitHub
            </a>
          </div>
        </header>

        <div data-bento-wrap="">
          <div className="v4-bento">
            <a
              href="#about"
              data-card=""
              data-span="4"
              data-photo=""
              className="v4-card v4-card-photo"
            >
              <img src={imageSrc(profile.hero_image)} alt={profile.name} className="v4-photo-img" />
              <div className="v4-photo-fade"></div>
              <div className="v4-photo-foot">
                <div className="v4-card-foot">
                  <div>
                    <p className="v4-label">About me</p>
                    <h2 className="v4-card-title">{profile.name}</h2>
                  </div>
                </div>
              </div>
            </a>

            <div data-span="8" className="v4-card v4-marquee-card">
              <Texture />
              <div className="marquee-container">
                <div className="marquee">
                  <span>
                    <img alt="" /> <b></b>{" "}
                  </span>
                  {[...marquee, ...marquee].map((m, i) => (
                    <span key={i}>
                      <img src={DECOR.marqueeStar} alt="" /> <b>{m}</b>{" "}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <a href="#about" data-card="" data-span="4" className="v4-card v4-card-pad">
              <Texture />
              <div className="v4-card-body">
                <img src={imageSrc(profile.signature_image)} alt={`${profile.name} signature`} />
              </div>
              <Foot label={home.credentials_label} title={home.credentials_title} />
            </a>
            <a href="#projects" data-card="" data-span="4" className="v4-card v4-card-pad">
              <Texture />
              <div className="v4-card-body">
                <img src={asset(CARD_IMAGES.works)} alt="My works" />
              </div>
              <Foot label={home.projects_label} title={home.projects_title} />
            </a>

            <div data-span="8" data-stats="" className="v4-card v4-stats">
              <Texture />
              {stats.map((s, i) =>
                i === 2 ? (
                  <div className="v4-stat" key={s.id}>
                    <div className="v4-chips">
                      {chips(s.value).map((c) => (
                        <span className="v4-chip-blue" key={c}>
                          {c}
                        </span>
                      ))}
                    </div>
                    <span className="v4-label">{plain(s.label)}</span>
                  </div>
                ) : (
                  <div className="v4-stat" key={s.id}>
                    <span className="v4-stat-value">{s.value}</span>
                    <span className="v4-label">{plain(s.label)}</span>
                  </div>
                ),
              )}
            </div>

            <a
              href={github}
              target="_blank"
              rel="noopener"
              data-card=""
              data-span="3"
              className="v4-card v4-card-pad"
            >
              <Texture />
              <div className="v4-card-body">
                <img src={asset(CARD_IMAGES.github)} alt="GitHub" className="v4-github-img" />
              </div>
              <Foot label={home.github_label} title={home.github_title} />
            </a>
            <a href="#services" data-card="" data-span="6" className="v4-card v4-card-pad">
              <Texture />
              <div className="v4-card-body">
                <div className="v4-tiles">
                  {SERVICE_ICONS.map((c) => (
                    <span className="v4-icon-tile" key={c}>
                      <i className={c} aria-hidden="true"></i>
                    </span>
                  ))}
                </div>
              </div>
              <Foot label={home.services_label} title={home.services_title} />
            </a>
            <div data-card="" data-span="3" className="v4-card v4-card-pad">
              <Texture />
              <div className="v4-circles">
                {socials
                  .filter((s) => PROFILE_ICONS[s.id])
                  .map((s) => (
                    <a
                      key={s.id}
                      href={s.href}
                      target="_blank"
                      rel="noopener"
                      aria-label={s.label}
                      className="v4-circle-link"
                    >
                      <i className={PROFILE_ICONS[s.id]} aria-hidden="true"></i>
                    </a>
                  ))}
              </div>
              <a href="#contact" className="v4-card-foot">
                <div>
                  <p className="v4-label">{home.profiles_label}</p>
                  <h2 className="v4-card-title">{home.profiles_title}</h2>
                </div>
              </a>
            </div>

            <a
              href="#contact"
              data-card=""
              data-span="12"
              data-cta=""
              className="v4-card v4-cta-card"
            >
              <Texture />
              <img src={DECOR.ctaStar} alt="" className="v4-cta-star" />
              <h2 className="v4-cta-title">
                {home.cta_title.replace(/\s*\S+$/, "")}{" "}
                <span className="v4-accent">{home.cta_title.match(/\S+$/)?.[0]}</span>
              </h2>
              <span className="v4-btn">
                Get in touch <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
