// The Help band (design: the un-id'd "Help" section): Download my resume / Have a project in
// mind?, then "Last updated" and "Edit on GitHub". Last updated is the build month: the site is
// rebuilt on every content or code change.
import { RESUME, SITE, asset } from "@/lib/site";

const LAST_UPDATED = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

export default function HelpSection() {
  return (
    <section data-screen-label="Help" className="v4-help-band">
      <div data-doc="" className="v4-doc v4-doc-last">
        <div data-help="" className="v4-help">
          <div className="v4-help-cell">
            <i className="fa-solid fa-file-arrow-down" aria-hidden="true"></i>
            <h3 className="v4-help-title">Download my resume</h3>
            <p className="v4-help-text">
              My latest resume as a PDF: experience, education and skills.
            </p>
            <a href={asset(RESUME.path)} download={RESUME.filename} className="v4-help-link">
              Download PDF <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
            </a>
          </div>
          <div className="v4-help-cell">
            <i className="fa-solid fa-comments" aria-hidden="true"></i>
            <h3 className="v4-help-title">Have a project in mind?</h3>
            <p className="v4-help-text">Send a message and I&apos;ll get back to you.</p>
            <a href="#contact" className="v4-help-link">
              Get in touch <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
            </a>
          </div>
        </div>
        <div className="v4-meta-row">
          <span className="v4-meta">Last updated on {LAST_UPDATED}</span>
          <a href={SITE.repoUrl} target="_blank" rel="noopener" className="v4-link">
            <i className="fab fa-github" aria-hidden="true"></i>Edit on GitHub
            <i className="fa-solid fa-arrow-right v4-ext" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
