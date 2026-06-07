import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";

import {
  createEmptyCertificate,
  createEmptyProject,
  getGoogleDrivePreviewUrl,
  parseTechStack,
  type PersonalPortfolioData,
} from "@/lib/personalPortfolio";
import styles from "@/styles/personalPortfolio.module.css";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

type SaveStatus =
  | { kind: "idle"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function PersonalPortfolioManagePage({ data }: Props) {
  const [draft, setDraft] = useState<PersonalPortfolioData>(data);
  const [skillInput, setSkillInput] = useState("");
  const [editorKey, setEditorKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>({
    kind: "idle",
    message: "",
  });

  const updateProject = (
    index: number,
    field: keyof PersonalPortfolioData["projects"][number],
    value: string
  ) => {
    setDraft((current) => {
      const nextProjects = [...current.projects];
      const project = { ...nextProjects[index] };

      if (field === "techStack") {
        project.techStack = parseTechStack(value);
      } else {
        project[field] = value;
      }

      nextProjects[index] = project;

      return {
        ...current,
        projects: nextProjects,
      };
    });
  };

  const updateCertificate = (
    index: number,
    field: keyof PersonalPortfolioData["certificates"][number],
    value: string
  ) => {
    setDraft((current) => {
      const nextCertificates = [...current.certificates];
      const certificate = { ...nextCertificates[index] };
      certificate[field] = value;

      nextCertificates[index] = certificate;

      return {
        ...current,
        certificates: nextCertificates,
      };
    });
  };

  const moveItem = <T,>(items: T[], index: number, direction: -1 | 1): T[] => {
    const next = [...items];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= items.length) {
      return next;
    }

    const currentItem = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = currentItem;
    return next;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus({ kind: "idle", message: "" });

    try {
      const response = await fetch("/api/personal-portfolio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(editorKey.trim()
            ? { "x-portfolio-key": editorKey.trim() }
            : {}),
        },
        body: JSON.stringify(draft),
      });

      const payload = (await response.json()) as
        | PersonalPortfolioData
        | { message?: string };

      if (!response.ok) {
        setStatus({
          kind: "error",
          message:
            "message" in payload && payload.message
              ? payload.message
              : "Could not save portfolio changes.",
        });
        return;
      }

      setDraft(payload as PersonalPortfolioData);
      setStatus({
        kind: "success",
        message: "Portfolio content saved successfully.",
      });
    } catch {
      setStatus({
        kind: "error",
        message: "Saving failed. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Manage Personal Portfolio</title>
        <meta
          name="description"
          content="Manage the public personal portfolio content inside this project."
        />
      </Head>

      <div className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.topbar}>
            <div className={styles.brand}>
              <div className={styles.brandMark}>PM</div>
              <div>
                <h1 className={styles.brandTitle}>Portfolio Manager</h1>
                <p className={styles.brandSubtitle}>
                  Update the public page at /personal/protfollio
                </p>
              </div>
            </div>

            <nav className={styles.nav}>
              <Link className={styles.navLink} href="/personal/protfollio">
                View Portfolio
              </Link>
              <Link className={styles.primaryButton} href="/">
                Back Home
              </Link>
            </nav>
          </header>

          <div className={styles.managerLayout}>
            <section className={styles.managerCard}>
              <h2 className={styles.managerTitle}>Profile Details</h2>
              <p className={styles.managerSubtitle}>
                Edit your headline, contact info, and skills here. These values
                render directly on the public portfolio page.
              </p>

              <div className={styles.fieldGrid}>
                <div>
                  <label className={styles.fieldLabel}>Name</label>
                  <input
                    className={styles.input}
                    value={draft.profile.name}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        profile: {
                          ...current.profile,
                          name: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Role</label>
                  <input
                    className={styles.input}
                    value={draft.profile.role}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        profile: {
                          ...current.profile,
                          role: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Location</label>
                  <input
                    className={styles.input}
                    value={draft.profile.location}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        profile: {
                          ...current.profile,
                          location: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Email</label>
                  <input
                    className={styles.input}
                    value={draft.profile.email}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        profile: {
                          ...current.profile,
                          email: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Profile photo URL</label>
                  <input
                    className={styles.input}
                    value={draft.profile.photoUrl}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        profile: {
                          ...current.profile,
                          photoUrl: event.target.value,
                        },
                      }))
                    }
                    placeholder="Google Drive image link or direct image URL"
                  />
                </div>
                <div className={styles.wideField}>
                  <label className={styles.fieldLabel}>Tagline</label>
                  <input
                    className={styles.input}
                    value={draft.profile.tagline}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        profile: {
                          ...current.profile,
                          tagline: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className={styles.wideField}>
                  <label className={styles.fieldLabel}>About</label>
                  <textarea
                    className={styles.textarea}
                    value={draft.profile.about}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        profile: {
                          ...current.profile,
                          about: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>GitHub URL</label>
                  <input
                    className={styles.input}
                    value={draft.profile.githubUrl}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        profile: {
                          ...current.profile,
                          githubUrl: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>LinkedIn URL</label>
                  <input
                    className={styles.input}
                    value={draft.profile.linkedinUrl}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        profile: {
                          ...current.profile,
                          linkedinUrl: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className={styles.wideField}>
                  <label className={styles.fieldLabel}>Resume URL</label>
                  <input
                    className={styles.input}
                    value={draft.profile.resumeUrl}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        profile: {
                          ...current.profile,
                          resumeUrl: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div className={styles.toolbar}>
                <input
                  className={styles.input}
                  style={{ maxWidth: 260 }}
                  value={skillInput}
                  onChange={(event) => setSkillInput(event.target.value)}
                  placeholder="Add a skill"
                />
                <button
                  type="button"
                  className={styles.smallButton}
                  onClick={() => {
                    const value = skillInput.trim();
                    if (!value) {
                      return;
                    }

                    setDraft((current) => ({
                      ...current,
                      profile: {
                        ...current.profile,
                        skills: [...current.profile.skills, value],
                      },
                    }));
                    setSkillInput("");
                  }}
                >
                  Add Skill
                </button>
              </div>

              <div className={styles.metaRow}>
                {draft.profile.skills.map((skill, index) => (
                  <button
                    key={`${skill}-${index}`}
                    type="button"
                    className={styles.stackChip}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        profile: {
                          ...current.profile,
                          skills: current.profile.skills.filter(
                            (_, skillIndex) => skillIndex !== index
                          ),
                        },
                      }))
                    }
                    title="Click to remove"
                  >
                    {skill} ×
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.managerCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.managerTitle}>Projects</h2>
                  <p className={styles.managerSubtitle}>
                    Add new public projects here. The live project URL is the
                    main link shown on the portfolio page.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      projects: [...current.projects, createEmptyProject()],
                    }))
                  }
                >
                  Add Project
                </button>
              </div>

              <div className={styles.managerGrid}>
                {draft.projects.map((project, index) => (
                  <div key={project.id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemTitle}>
                        {project.title || `Project ${index + 1}`}
                      </h3>
                      <div className={styles.toolbar}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              projects: moveItem(current.projects, index, -1),
                            }))
                          }
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              projects: moveItem(current.projects, index, 1),
                            }))
                          }
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              projects: current.projects.filter(
                                (_, itemIndex) => itemIndex !== index
                              ),
                            }))
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className={styles.fieldGrid}>
                      <div>
                        <label className={styles.fieldLabel}>Title</label>
                        <input
                          className={styles.input}
                          value={project.title}
                          onChange={(event) =>
                            updateProject(index, "title", event.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className={styles.fieldLabel}>Live URL</label>
                        <input
                          className={styles.input}
                          value={project.liveUrl}
                          onChange={(event) =>
                            updateProject(index, "liveUrl", event.target.value)
                          }
                          placeholder="https://your-project-link.com"
                        />
                      </div>
                      <div className={styles.wideField}>
                        <label className={styles.fieldLabel}>Description</label>
                        <textarea
                          className={styles.textarea}
                          value={project.description}
                          onChange={(event) =>
                            updateProject(
                              index,
                              "description",
                              event.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className={styles.fieldLabel}>
                          Tech stack
                        </label>
                        <input
                          className={styles.input}
                          value={project.techStack.join(", ")}
                          onChange={(event) =>
                            updateProject(index, "techStack", event.target.value)
                          }
                          placeholder="React, Node.js, TypeScript"
                        />
                      </div>
                      <div>
                        <label className={styles.fieldLabel}>Highlight</label>
                        <input
                          className={styles.input}
                          value={project.highlight}
                          onChange={(event) =>
                            updateProject(index, "highlight", event.target.value)
                          }
                        />
                      </div>
                      <div className={styles.wideField}>
                        <label className={styles.fieldLabel}>
                          Optional image URL
                        </label>
                        <input
                          className={styles.input}
                          value={project.imageUrl}
                          onChange={(event) =>
                            updateProject(index, "imageUrl", event.target.value)
                          }
                          placeholder="Optional screenshot or cover image URL"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.managerCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.managerTitle}>Certificates</h2>
                  <p className={styles.managerSubtitle}>
                    Paste a Google Drive image link for the certificate image.
                    That image will render on the public page automatically.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      certificates: [
                        ...current.certificates,
                        createEmptyCertificate(),
                      ],
                    }))
                  }
                >
                  Add Certificate
                </button>
              </div>

              <div className={styles.managerGrid}>
                {draft.certificates.map((certificate, index) => {
                  const previewUrl = certificate.imageUrl
                    ? getGoogleDrivePreviewUrl(certificate.imageUrl)
                    : "";

                  return (
                    <div key={certificate.id} className={styles.itemCard}>
                      <div className={styles.itemHeader}>
                        <h3 className={styles.itemTitle}>
                          {certificate.title || `Certificate ${index + 1}`}
                        </h3>
                        <div className={styles.toolbar}>
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                certificates: moveItem(
                                  current.certificates,
                                  index,
                                  -1
                                ),
                              }))
                            }
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                certificates: moveItem(
                                  current.certificates,
                                  index,
                                  1
                                ),
                              }))
                            }
                          >
                            Down
                          </button>
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                certificates: current.certificates.filter(
                                  (_, itemIndex) => itemIndex !== index
                                ),
                              }))
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className={styles.fieldGrid}>
                        <div>
                          <label className={styles.fieldLabel}>Title</label>
                          <input
                            className={styles.input}
                            value={certificate.title}
                            onChange={(event) =>
                              updateCertificate(
                                index,
                                "title",
                                event.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className={styles.fieldLabel}>Issuer</label>
                          <input
                            className={styles.input}
                            value={certificate.issuer}
                            onChange={(event) =>
                              updateCertificate(
                                index,
                                "issuer",
                                event.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className={styles.fieldLabel}>Issued at</label>
                          <input
                            className={styles.input}
                            value={certificate.issuedAt}
                            onChange={(event) =>
                              updateCertificate(
                                index,
                                "issuedAt",
                                event.target.value
                              )
                            }
                            placeholder="2026 or March 2026"
                          />
                        </div>
                        <div>
                          <label className={styles.fieldLabel}>
                            Credential URL
                          </label>
                          <input
                            className={styles.input}
                            value={certificate.credentialUrl}
                            onChange={(event) =>
                              updateCertificate(
                                index,
                                "credentialUrl",
                                event.target.value
                              )
                            }
                            placeholder="Optional verify link"
                          />
                        </div>
                        <div className={styles.wideField}>
                          <label className={styles.fieldLabel}>
                            Google Drive image link
                          </label>
                          <input
                            className={styles.input}
                            value={certificate.imageUrl}
                            onChange={(event) =>
                              updateCertificate(
                                index,
                                "imageUrl",
                                event.target.value
                              )
                            }
                            placeholder="https://drive.google.com/file/d/..."
                          />
                        </div>
                      </div>

                      {previewUrl && (
                        <div className={styles.previewBox}>
                          <div className={styles.previewThumb}>
                            <Image
                              src={previewUrl}
                              alt={certificate.title}
                              fill
                              unoptimized
                              sizes="82px"
                            />
                          </div>
                          <div className={styles.previewText}>
                            Google Drive image detected. This preview is how it
                            will appear on the public portfolio page.
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={styles.managerCard}>
              <h2 className={styles.managerTitle}>Save Changes</h2>
              <p className={styles.managerSubtitle}>
                This setup writes into a JSON file inside your project. It does
                not use a database.
              </p>

              <div className={styles.fieldGrid}>
                <div className={styles.wideField}>
                  <label className={styles.fieldLabel}>
                    Optional editor key
                  </label>
                  <input
                    className={styles.input}
                    value={editorKey}
                    onChange={(event) => setEditorKey(event.target.value)}
                    placeholder="Only needed if you set PERSONAL_PORTFOLIO_EDITOR_KEY in .env.local"
                  />
                  <p className={styles.helperText}>
                    If you leave the env key unset, this page stays open for
                    editing. If you set the env key, this value must match it.
                  </p>
                </div>
              </div>

              <div className={styles.toolbar}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Portfolio Content"}
                </button>
                <Link
                  className={styles.secondaryButton}
                  href="/personal/protfollio"
                >
                  Preview Public Page
                </Link>
              </div>

              {status.message && (
                <div
                  className={`${styles.statusMessage} ${
                    status.kind === "success"
                      ? styles.statusSuccess
                      : styles.statusError
                  }`}
                >
                  {status.message}
                </div>
              )}
            </section>
          </div>
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
