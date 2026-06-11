import type { Project } from "@/lib/github";

/**
 * Fallback project list, used when the GitHub API is unreachable or
 * rate-limited at build/request time. This data mirrors the real public
 * repositories on https://github.com/rakexhs as of the last successful fetch —
 * nothing here is fabricated.
 */

export const fallbackProjects: Project[] = [
  {
    name: "TrueScan",
    title: "TrueScan",
    description: "TrueScan Visual Synthetic Image Verification System",
    language: "Jupyter Notebook",
    url: "https://github.com/rakexhs/TrueScan",
    homepage: null,
    stars: 0,
    pushedAt: "2026-05-11T07:04:51Z",
    topics: [],
    featured: true,
    domain: "AI / Computer Vision",
  },
  {
    name: "tokenscope-llama-latency-lab",
    title: "TokenScope — LLaMA Latency Lab",
    description:
      "Experimental lab for measuring and analyzing LLaMA token-level inference latency.",
    language: "Python",
    url: "https://github.com/rakexhs/tokenscope-llama-latency-lab",
    homepage: null,
    stars: 0,
    pushedAt: "2026-03-10T07:39:19Z",
    topics: [],
    featured: false,
    domain: "AI / LLM Systems",
  },
  {
    name: "triptunes_mern",
    title: "TripTunes",
    description: "Travel Booking site using MERN and tailwind css",
    language: "JavaScript",
    url: "https://github.com/rakexhs/triptunes_mern",
    homepage: "https://triptunes.onrender.com",
    stars: 1,
    pushedAt: "2023-11-11T00:53:25Z",
    topics: [],
    featured: false,
    domain: "Full-Stack Web",
  },
  {
    name: "Prognosis-PredictDisease",
    title: "Prognosis",
    description: "Prognosis is a symptom based disease prediction website.",
    language: "EJS",
    url: "https://github.com/rakexhs/Prognosis-PredictDisease",
    homepage: null,
    stars: 1,
    pushedAt: "2023-11-06T11:35:00Z",
    topics: [],
    featured: false,
    domain: "Web / ML",
  },
];
