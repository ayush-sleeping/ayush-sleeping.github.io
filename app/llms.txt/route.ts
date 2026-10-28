// llms.txt: a plain-text summary of the portfolio for AI assistants (https://llmstxt.org), built
// from the same sheet data as the page, so it never drifts from what the site says.
import { getExperience, getProfile, getProjects, getSocials } from "@/lib/data";
import { RESUME, SECTION_IDS, SITE } from "@/lib/site";

export const dynamic = "force-static";

const SECTION_NOTES: Record<(typeof SECTION_IDS)[number], string> = {
  home: "Overview: role, current stack, and links to credentials, projects, services and profiles.",
  about:
    "Background and a quick-facts grid (interest, stack, focus, experience, education, email, address).",
  experience: "Work history: professional roles, then training programs during college.",
  education: "Degree and schooling, with relevant courses.",
  certifications: "Certificates from training programs, competitions and courses.",
  skills: "Established stack and the current learning focus.",
  projects: "Shipped projects with tech stack, source links and live demos.",
  services: "What he takes on: fullstack, backend, frontend, and production/team work.",
  contact: "Contact details and the contact form.",
  faq: "Frequently asked questions about his work and services.",
};

const plain = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const title = (id: string) => id[0].toUpperCase() + id.slice(1);

export function GET() {
  const profile = getProfile();
  const github = getSocials().find((s) => s.id === "github")?.href;

  const lines = [
    `# ${profile.name} — ${profile.tagline}`,
    "",
    `> ${plain(profile.bio)}`,
    "",
    `Contact: ${profile.email}${github ? ` · GitHub: ${github}` : ""}`,
    `Location: ${profile.location}`,
    `URL: ${SITE.url}`,
    `Resume (PDF): ${SITE.url}${RESUME.path}`,
    "",
    "## Sections",
    "",
    "The portfolio is a single page; each section has its own anchor.",
    "",
    ...SECTION_IDS.map((id) => `- [${title(id)}](${SITE.url}#${id}): ${SECTION_NOTES[id]}`),
    "",
    "## Experience",
    "",
    ...getExperience().map((e) =>
      [
        `- ${e.title}${e.company ? ` — ${e.company}` : ""}`,
        e.date_label && ` (${e.date_label})`,
        e.description && `. ${plain(e.description)}`,
      ]
        .filter(Boolean)
        .join(""),
    ),
    "",
    "## Projects",
    "",
    ...getProjects().map((p) =>
      [
        `- ${p.title}`,
        p.year && ` (${p.year})`,
        ` — ${plain(p.description || p.summary)}`,
        p.tech_stack && ` Stack: ${p.tech_stack}.`,
        (p.live_url || p.github_url) && ` ${p.live_url || p.github_url}`,
      ]
        .filter(Boolean)
        .join(""),
    ),
    "",
    "## Technical notes",
    "",
    "- Built with Next.js as a static export, hosted on GitHub Pages.",
    "- Content is edited in a Google Sheet; a scheduled GitHub Action validates it and commits",
    "  JSON, which is written into the HTML at build time.",
    `- Source: ${SITE.repoUrl}`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
