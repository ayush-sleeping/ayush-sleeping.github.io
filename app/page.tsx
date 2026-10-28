// The one-page portfolio in the v4 design (task.md Phase 11): the Shell (sidebar, top bar,
// palette, progress, back-to-top, toast) around the ten sections, the Help band and the footer.
// Section ids: SECTION_IDS in lib/site.ts.
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/layout/StructuredData";
import Motion from "@/components/client/Motion";
import Shell, { type SideItem } from "@/components/client/Shell";
import AboutSection from "@/components/sections/AboutSection";
import CertificationsSection from "@/components/sections/CertificationsSection";
import ContactSection from "@/components/sections/ContactSection";
import EducationSection from "@/components/sections/EducationSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import FaqSection from "@/components/sections/FaqSection";
import HelpSection from "@/components/sections/HelpSection";
import HomeSection from "@/components/sections/HomeSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ServicesSection from "@/components/sections/ServicesSection";
import SkillsSection from "@/components/sections/SkillsSection";
import { getFooterTech, getNavigation, getProfile, getProjects, getSocials } from "@/lib/data";
import { imageSrc, projectAnchor } from "@/lib/site";

// The sidebar's labels are the design's (T10); the sections themselves come from the sheet.
const PALETTE_SECTIONS = [
  ["home", "Overview"],
  ["about", "About me"],
  ["experience", "Experience"],
  ["education", "Education"],
  ["certifications", "Certifications"],
  ["skills", "Skills & Technologies"],
  ["projects", "Projects"],
  ["services", "Services"],
  ["contact", "Contact"],
  ["faq", "FAQ"],
].map(([id, label]) => ({ id, label }));

export default function Home() {
  const profile = getProfile();
  const nav = getNavigation();
  const socials = getSocials();
  const projects = getProjects();
  const projectLinks = projects.map((p) => ({ id: projectAnchor(p.title), label: p.title }));

  const sideList: SideItem[] = [
    { id: "about", label: "About me" },
    {
      id: "career",
      href: "experience",
      label: "Career",
      children: PALETTE_SECTIONS.filter((s) =>
        ["experience", "education", "certifications", "skills"].includes(s.id),
      ),
    },
    { id: "projects", label: "Projects", children: projectLinks },
    { id: "services", label: "Services" },
    { id: "contact", label: "Contact" },
    { id: "faq", label: "FAQ" },
  ];
  // Every id the sidebar can highlight, in page order (the design's SPY()).
  const spyIds = [
    "home",
    ...sideList.flatMap((i) =>
      i.children
        ? i.id === "projects"
          ? ["projects", ...i.children.map((c) => c.id)]
          : i.children.map((c) => c.id)
        : [i.id],
    ),
  ];

  return (
    <>
      <StructuredData />
      <Shell
        brand={profile.brand}
        avatar={imageSrc(profile.profile_image)}
        ctaLabel={profile.cta_label}
        email={profile.email}
        nav={nav.map((n) => ({ id: n.id, label: n.label }))}
        sideList={sideList}
        spyIds={spyIds}
        paletteSections={PALETTE_SECTIONS}
        projects={projects.map((p) => ({
          title: p.title,
          anchor: projectAnchor(p.title),
          category: p.category ?? "",
        }))}
        socials={socials.map((s) => ({ label: s.label, href: s.href, icon_class: s.icon_class }))}
      >
        <main>
          <HomeSection />
          <AboutSection />
          <ExperienceSection />
          <EducationSection />
          <CertificationsSection />
          <SkillsSection />
          <ProjectsSection />
          <ServicesSection />
          <ContactSection />
          <FaqSection />
          <HelpSection />
        </main>
        <Footer
          brand={profile.brand}
          tagline={profile.tagline}
          copyright={profile.copyright}
          nav={nav}
          projects={projects}
          socials={socials}
          tech={getFooterTech()}
        />
      </Shell>
      <Motion />
    </>
  );
}
