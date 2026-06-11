import { personal } from "@/data/personal";

export type Project = {
  name: string;
  title: string;
  description: string;
  language: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  pushedAt: string;
  topics: string[];
  featured: boolean;
  domain: string;
};

type GitHubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  pushed_at: string;
  topics?: string[];
  fork: boolean;
  archived: boolean;
};

const TITLE_OVERRIDES: Record<string, string> = {
  triptunes_mern: "TripTunes",
  "Prognosis-PredictDisease": "Prognosis",
  "tokenscope-llama-latency-lab": "TokenScope — LLaMA Latency Lab",
  portfolio_rakesh: "Portfolio v1",
};

const DESCRIPTION_OVERRIDES: Record<string, string> = {
  // Repo has no GitHub description; derived from the repo name, not invented.
  "tokenscope-llama-latency-lab":
    "Experimental lab for measuring and analyzing LLaMA token-level inference latency.",
};

const DOMAIN_RULES: [RegExp, string][] = [
  [/llm|llama|token|gpt|prompt/i, "AI / LLM Systems"],
  [/scan|vision|image|detect|predict/i, "AI / Computer Vision"],
  [/mern|booking|travel|web|site/i, "Full-Stack Web"],
  [/swift|ios/i, "Swift / iOS"],
  [/electron|desktop/i, "Desktop / Electron"],
  [/portfolio/i, "Web / Frontend"],
];

function inferDomain(repo: GitHubRepo): string {
  const haystack = `${repo.name} ${repo.description ?? ""} ${(
    repo.topics ?? []
  ).join(" ")}`;
  for (const [pattern, domain] of DOMAIN_RULES) {
    if (pattern.test(haystack)) return domain;
  }
  return repo.language ? `${repo.language}` : "Software";
}

/** Score repos so AI/LLM, recent, described, demo-linked work surfaces first. */
function scoreRepo(repo: GitHubRepo): number {
  let score = 0;
  const haystack = `${repo.name} ${repo.description ?? ""}`.toLowerCase();
  if (/llm|llama|ai|vision|scan|token|synthetic/.test(haystack)) score += 40;
  if (/swift|electron|mern|full.?stack|web/.test(haystack)) score += 20;
  if (repo.description) score += 15;
  if (repo.homepage) score += 15;
  score += Math.min(repo.stargazers_count * 5, 25);
  const ageDays =
    (Date.now() - new Date(repo.pushed_at).getTime()) / 86_400_000;
  if (ageDays < 180) score += 30;
  else if (ageDays < 540) score += 15;
  if (/portfolio/.test(haystack)) score -= 30;
  return score;
}

function toProject(repo: GitHubRepo, featured: boolean): Project {
  return {
    name: repo.name,
    title: TITLE_OVERRIDES[repo.name] ?? prettifyName(repo.name),
    description:
      repo.description ??
      DESCRIPTION_OVERRIDES[repo.name] ??
      "Public repository on GitHub.",
    language: repo.language,
    url: repo.html_url,
    homepage: repo.homepage || null,
    stars: repo.stargazers_count,
    pushedAt: repo.pushed_at,
    topics: repo.topics ?? [],
    featured,
    domain: inferDomain(repo),
  };
}

function prettifyName(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/**
 * Fetches public repositories from the GitHub API and ranks them for the
 * portfolio. Falls back to `fallbackProjects` (real snapshot data) if the
 * API is unreachable or rate-limited.
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${personal.githubUser}/repos?per_page=100&sort=updated`,
      {
        headers: { Accept: "application/vnd.github+json" },
        // Revalidate hourly so deploys stay fresh without hammering the API.
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
    const repos = (await res.json()) as GitHubRepo[];

    const ranked = repos
      .filter((r) => !r.fork && !r.archived)
      .filter((r) => r.name !== "portfolio_rakesh") // skip the old portfolio itself
      .sort((a, b) => scoreRepo(b) - scoreRepo(a));

    if (ranked.length === 0) throw new Error("No usable repositories found");

    return ranked.map((repo, i) => toProject(repo, i === 0));
  } catch {
    // GRACEFUL FALLBACK: GitHub API failed or rate-limited — serve the
    // snapshot of real repository data from src/data/fallbackProjects.ts.
    const { fallbackProjects } = await import("@/data/fallbackProjects");
    return fallbackProjects;
  }
}
