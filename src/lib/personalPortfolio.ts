import portfolioSeed from "@/data/personalPortfolio.json";

export type PortfolioProfile = {
  name: string;
  role: string;
  location: string;
  tagline: string;
  about: string;
  email: string;
  photoUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  skills: string[];
};

export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  highlight: string;
  liveUrl: string;
  imageUrl: string;
};

export type PortfolioCertificate = {
  id: string;
  title: string;
  issuer: string;
  issuedAt: string;
  imageUrl: string;
  credentialUrl: string;
};

export type PersonalPortfolioData = {
  profile: PortfolioProfile;
  projects: PortfolioProject[];
  certificates: PortfolioCertificate[];
  updatedAt: string;
};

type AnyRecord = Record<string, unknown>;

export const defaultPersonalPortfolio =
  portfolioSeed as PersonalPortfolioData;

export function normalizeUrl(value: string): string {
  const clean = value.trim();
  if (!clean) {
    return "";
  }

  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}

export function makeItemId(input: string, fallback: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function parseTechStack(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getGoogleDriveFileId(url: string): string {
  const clean = url.trim();
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/i,
    /drive\.google\.com\/open\?id=([^&]+)/i,
    /drive\.google\.com\/uc\?id=([^&]+)/i,
    /drive\.google\.com\/thumbnail\?id=([^&]+)/i,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return "";
}

export function getGoogleDrivePreviewUrl(url: string): string {
  const fileId = getGoogleDriveFileId(url);
  if (!fileId) {
    return normalizeUrl(url);
  }

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
}

export function getGoogleDriveImageUrl(url: string): string {
  const fileId = getGoogleDriveFileId(url);
  if (!fileId) {
    return normalizeUrl(url);
  }

  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function getGoogleDriveOpenUrl(url: string): string {
  const fileId = getGoogleDriveFileId(url);
  if (!fileId) {
    return normalizeUrl(url);
  }

  return `https://drive.google.com/file/d/${fileId}/view`;
}

function isRecord(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function createEmptyProject(): PortfolioProject {
  return {
    id: `project-${Date.now()}`,
    title: "",
    description: "",
    techStack: [],
    highlight: "",
    liveUrl: "",
    imageUrl: "",
  };
}

export function createEmptyCertificate(): PortfolioCertificate {
  return {
    id: `certificate-${Date.now()}`,
    title: "",
    issuer: "",
    issuedAt: "",
    imageUrl: "",
    credentialUrl: "",
  };
}

export function ensurePortfolioData(raw: unknown): PersonalPortfolioData {
  const source = isRecord(raw) ? raw : {};
  const profileSource = isRecord(source.profile) ? source.profile : {};

  const projectsSource = Array.isArray(source.projects)
    ? source.projects
    : defaultPersonalPortfolio.projects;
  const certificatesSource = Array.isArray(source.certificates)
    ? source.certificates
    : defaultPersonalPortfolio.certificates;

  return {
    profile: {
      name: readString(
        profileSource.name,
        defaultPersonalPortfolio.profile.name
      ),
      role: readString(
        profileSource.role,
        defaultPersonalPortfolio.profile.role
      ),
      location: readString(
        profileSource.location,
        defaultPersonalPortfolio.profile.location
      ),
      tagline: readString(
        profileSource.tagline,
        defaultPersonalPortfolio.profile.tagline
      ),
      about: readString(
        profileSource.about,
        defaultPersonalPortfolio.profile.about
      ),
      email: readString(
        profileSource.email,
        defaultPersonalPortfolio.profile.email
      ),
      photoUrl: readString(profileSource.photoUrl),
      githubUrl: readString(profileSource.githubUrl),
      linkedinUrl: readString(profileSource.linkedinUrl),
      resumeUrl: readString(profileSource.resumeUrl),
      skills: readStringArray(
        profileSource.skills,
        defaultPersonalPortfolio.profile.skills
      ),
    },
    projects: projectsSource
      .filter(isRecord)
      .map((item, index) => {
        const title = readString(item.title);

        return {
          id: readString(item.id, makeItemId(title, `project-${index + 1}`)),
          title,
          description: readString(item.description),
          techStack: readStringArray(item.techStack),
          highlight: readString(item.highlight),
          liveUrl: readString(item.liveUrl),
          imageUrl: readString(item.imageUrl),
        };
      }),
    certificates: certificatesSource
      .filter(isRecord)
      .map((item, index) => {
        const title = readString(item.title);

        return {
          id: readString(
            item.id,
            makeItemId(title, `certificate-${index + 1}`)
          ),
          title,
          issuer: readString(item.issuer),
          issuedAt: readString(item.issuedAt),
          imageUrl: readString(item.imageUrl),
          credentialUrl: readString(item.credentialUrl),
        };
      }),
    updatedAt: readString(
      source.updatedAt,
      defaultPersonalPortfolio.updatedAt
    ),
  };
}
