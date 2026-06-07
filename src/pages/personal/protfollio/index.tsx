import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";

import {
  getGoogleDriveImageUrl,
  getGoogleDriveOpenUrl,
  getGoogleDrivePreviewUrl,
  normalizeUrl,
  type PersonalPortfolioData,
} from "@/lib/personalPortfolio";
import styles from "@/styles/personalPortfolio.module.css";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function getUrlHostname(value: string): string {
  const normalized = normalizeUrl(value);
  if (!normalized) {
    return "";
  }

  try {
    return new URL(normalized).hostname.replace(/^www\./i, "");
  } catch {
    return normalized;
  }
}

function formatUtcDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes} UTC`;
}

export default function PersonalPortfolioPage({ data }: Props) {
  const [search, setSearch] = useState("");
  const motionWords = useMemo(
    () => [
      data.profile.role,
      "React Builder",
      "TypeScript Developer",
      "Node.js Creator",
    ],
    [data.profile.role]
  );
  const [activeMotionWordIndex, setActiveMotionWordIndex] = useState(0);
  const profileImageUrl = "/photo.jpg";

  useEffect(() => {
    if (motionWords.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveMotionWordIndex((current) => (current + 1) % motionWords.length);
    }, 2200);

    return () => window.clearInterval(interval);
  }, [motionWords]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return data.projects;
    }

    return data.projects.filter((project) => {
      const haystack = [
        project.title,
        project.description,
        project.highlight,
        project.liveUrl,
        project.techStack.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [data.projects, search]);

  const portfolioLinks = [
    {
      label: "GitHub",
      value: data.profile.githubUrl,
    },
    {
      label: "LinkedIn",
      value: data.profile.linkedinUrl,
    },
    {
      label: "Resume",
      value: data.profile.resumeUrl,
    },
  ].filter((item) => isNonEmpty(item.value));

  return (
    <>
      <Head>
        <title>{`${data.profile.name} | Personal Portfolio`}</title>
        <meta
          name="description"
          content={`${data.profile.name} portfolio with projects, certificates, skills, and contact links.`}
        />
      </Head>

      <div className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.topbar}>
            <div className={styles.brand}>
              <div className={styles.brandMark}>
                {getInitials(data.profile.name)}
              </div>
              <div>
                <h1 className={styles.brandTitle}>{data.profile.name}</h1>
                <p className={styles.brandSubtitle}>
                  {data.profile.role} • {data.profile.location}
                </p>
              </div>
            </div>

            <nav className={styles.nav}>
              <a className={styles.navLink} href="#projects">
                Projects
              </a>
              <a className={styles.navLink} href="#certificates">
                Certificates
              </a>
              <a className={styles.navLink} href="#contact">
                Contact
              </a>
            </nav>
          </header>

          <section className={styles.hero}>
            <div className={styles.heroCard}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowDot} />
                Available for new opportunities
              </div>

              <h2 className={styles.heroTitle}>
                {data.profile.name}
                <span className={styles.heroAccent}>{data.profile.role}</span>
              </h2>

              <p className={styles.heroText}>{data.profile.tagline}</p>

              <div className={styles.ctaRow}>
                <a className={styles.primaryButton} href="#projects">
                  View Projects
                </a>
                <a className={styles.secondaryButton} href="#certificates">
                  View Certificates
                </a>
                {isNonEmpty(data.profile.resumeUrl) && (
                  <a
                    className={styles.ghostButton}
                    href={normalizeUrl(data.profile.resumeUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Resume
                  </a>
                )}
              </div>

              <div className={styles.metaRow}>
                <div className={styles.metaPill}>
                  {data.projects.length} Projects
                </div>
                <div className={styles.metaPill}>
                  {data.certificates.length} Certificates
                </div>
                <div className={styles.metaPill}>
                  {data.profile.skills.length} Skills
                </div>
              </div>
            </div>

            <div className={styles.heroAside}>
              <div className={`${styles.card} ${styles.showcaseCard}`}>
                <div className={styles.showcaseSurface}>
                  <span className={`${styles.floatingBadge} ${styles.badgeTop}`}>
                    {data.profile.skills[0] || "React"}
                  </span>
                  <span
                    className={`${styles.floatingBadge} ${styles.badgeLeft}`}
                  >
                    {data.profile.skills[1] || "TypeScript"}
                  </span>
                  <span
                    className={`${styles.floatingBadge} ${styles.badgeRight}`}
                  >
                    {data.profile.skills[2] || "Node.js"}
                  </span>
                  <span
                    className={`${styles.floatingBadge} ${styles.badgeBottom}`}
                  >
                    {data.profile.skills[3] || "Next.js"}
                  </span>

                  <div className={styles.showcasePhotoWrap}>
                    <Image
                      src={profileImageUrl}
                      alt={`${data.profile.name} profile photo`}
                      fill
                      priority
                      sizes="(max-width: 720px) 150px, 268px"
                    />
                  </div>

                  <div className={styles.motionCard}>
                    <p className={styles.motionLead}>I&apos;m a</p>
                    <div className={styles.motionWordTrack}>
                      <span
                        key={motionWords[activeMotionWordIndex]}
                        className={styles.motionWord}
                      >
                        {motionWords[activeMotionWordIndex]}
                      </span>
                    </div>
                    <p className={styles.motionRoleLine}>
                      {data.profile.skills.slice(0, 4).join(" • ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.metricGrid}>
                <div className={`${styles.card} ${styles.metricCard}`}>
                  <span className={styles.metricValue}>
                    {data.projects.length}
                  </span>
                  <span className={styles.metricLabel}>Project Cards</span>
                </div>
                <div className={`${styles.card} ${styles.metricCard}`}>
                  <span className={styles.metricValue}>
                    {data.certificates.length}
                  </span>
                  <span className={styles.metricLabel}>Certificates</span>
                </div>
                <div className={`${styles.card} ${styles.metricCard}`}>
                  <span className={styles.metricValue}>
                    {portfolioLinks.length}
                  </span>
                  <span className={styles.metricLabel}>External Links</span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={`${styles.card} ${styles.aboutCard}`}>
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionLabel}>About</span>
                  <h2 className={styles.sectionTitle}>Personal Snapshot</h2>
                </div>
              </div>

              <div className={styles.aboutGrid}>
                <p className={styles.aboutLead}>{data.profile.about}</p>

                <div className={styles.aboutPanel}>
                  <h3 className={styles.aboutPanelTitle}>Quick info</h3>
                  <div className={styles.stack}>
                    {portfolioLinks.map((link) => (
                      <a
                        key={link.label}
                        className={styles.stackChip}
                        href={normalizeUrl(link.value)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.label}
                      </a>
                    ))}
                    {isNonEmpty(data.profile.email) && (
                      <a
                        className={styles.stackChip}
                        href={`mailto:${data.profile.email}`}
                      >
                        Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionLabel}>Skills</span>
                <h2 className={styles.sectionTitle}>Tech Stack</h2>
                <p className={styles.sectionText}>
                  A simple overview of the technologies and tools currently
                  featured in this portfolio.
                </p>
              </div>
            </div>

            <div className={`${styles.card} ${styles.aboutCard}`}>
              <div className={styles.stack}>
                {data.profile.skills.map((skill) => (
                  <span key={skill} className={styles.stackChip}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.section} id="projects">
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionLabel}>Projects</span>
                <h2 className={styles.sectionTitle}>Featured Work</h2>
                <p className={styles.sectionText}>
                  Inspired by the reference portfolio layout, but focused only
                  on your public work and personal achievements.
                </p>
              </div>

              <div className={styles.searchRow}>
                <input
                  className={styles.searchInput}
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, tech, or description"
                />
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <div className={styles.emptyState}>
                No projects matched &quot;{search}&quot;.
              </div>
            ) : (
              <div className={styles.projectGrid}>
                {filteredProjects.map((project) => (
                  <article
                    key={project.id}
                    className={`${styles.card} ${styles.projectCard}`}
                  >
                    <div className={styles.projectVisual}>
                      {isNonEmpty(project.liveUrl) ? (
                        <div className={styles.projectBrowser}>
                          <div className={styles.browserBar}>
                            <span className={styles.browserDot} />
                            <span className={styles.browserDot} />
                            <span className={styles.browserDot} />
                            <span className={styles.browserUrl}>
                              {getUrlHostname(project.liveUrl)}
                            </span>
                          </div>
                          <iframe
                            className={styles.projectFrame}
                            src={normalizeUrl(project.liveUrl)}
                            title={`${project.title} live preview`}
                            loading="lazy"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                          />
                          <div className={styles.frameHint}>
                            Live preview
                          </div>
                        </div>
                      ) : (
                        <div className={styles.projectFallback}>
                          <span className={styles.projectMonogram}>
                            {getInitials(project.title)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.projectTitle}>{project.title}</h3>
                      <p className={styles.projectDesc}>{project.description}</p>

                      {isNonEmpty(project.highlight) && (
                        <div className={styles.highlight}>
                          {project.highlight}
                        </div>
                      )}

                      {project.techStack.length > 0 && (
                        <div className={styles.metaRow}>
                          {project.techStack.map((tech) => (
                            <span key={tech} className={styles.stackChip}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={styles.actions}>
                        {isNonEmpty(project.liveUrl) && (
                          <span className={styles.linkPreview}>
                            {getUrlHostname(project.liveUrl)}
                          </span>
                        )}
                        {isNonEmpty(project.liveUrl) && (
                          <a
                            className={styles.primaryButton}
                            href={normalizeUrl(project.liveUrl)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Visit Project
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section} id="certificates">
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionLabel}>Certificates</span>
                  <h2 className={styles.sectionTitle}>Verified Learning</h2>
                  <p className={styles.sectionText}>
                    Add Google Drive image links in your private editor and
                    they will appear here automatically.
                  </p>
                </div>
              </div>

            <div className={styles.certificateGrid}>
              {data.certificates.map((certificate) => {
                const imageUrl = isNonEmpty(certificate.imageUrl)
                  ? getGoogleDriveImageUrl(certificate.imageUrl)
                  : "";
                const imageFallbackUrl = isNonEmpty(certificate.imageUrl)
                  ? getGoogleDrivePreviewUrl(certificate.imageUrl)
                  : "";
                const openUrl = isNonEmpty(certificate.credentialUrl)
                  ? getGoogleDriveOpenUrl(certificate.credentialUrl)
                  : getGoogleDriveOpenUrl(certificate.imageUrl);

                return (
                  <article
                    key={certificate.id}
                    className={`${styles.card} ${styles.certificateCard}`}
                  >
                    <div className={styles.certificateVisual}>
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={certificate.title}
                          fill
                          unoptimized
                          sizes="(max-width: 720px) 50vw, (max-width: 1200px) 33vw, 260px"
                          onError={(event) => {
                            const fallback = imageFallbackUrl;
                            if (
                              fallback &&
                              event.currentTarget.src !== fallback
                            ) {
                              event.currentTarget.src = fallback;
                            }
                          }}
                        />
                      ) : (
                        <div className={styles.projectVisual}>
                          <span className={styles.projectMonogram}>CERT</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.certificateTitle}>
                        {certificate.title}
                      </h3>
                      <p className={styles.certificateMeta}>
                        {certificate.issuer || "Issuer name"} •{" "}
                        {certificate.issuedAt || "Year"}
                      </p>
                      <div className={styles.actions}>
                        {isNonEmpty(openUrl) && (
                          <span className={styles.linkPreview}>
                            {getUrlHostname(openUrl)}
                          </span>
                        )}
                        {isNonEmpty(openUrl) && (
                          <a
                            className={styles.secondaryButton}
                            href={openUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Certificate
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.section} id="contact">
            <div className={`${styles.card} ${styles.contactCard}`}>
              <span className={styles.sectionLabel}>Contact</span>
              <h2 className={styles.sectionTitle}>Let&apos;s Build Something</h2>
              <p className={styles.sectionText}>
                This page is fully public, so visitors can open it directly
                without signing in.
              </p>

              <div className={styles.contactGrid}>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Email</span>
                  <span className={styles.contactValue}>
                    {data.profile.email || "Add your email in your private editor"}
                  </span>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Location</span>
                  <span className={styles.contactValue}>
                    {data.profile.location || "Add your location"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <footer className={styles.footer}>
            Built inside MythFlair AI • Updated{" "}
            {formatUtcDateTime(data.updatedAt)}
          </footer>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  data: PersonalPortfolioData;
}> = async () => {
  const { readPersonalPortfolio } = await import(
    "@/lib/personalPortfolioStore"
  );
  const data = await readPersonalPortfolio();

  return {
    props: {
      data,
    },
  };
};
