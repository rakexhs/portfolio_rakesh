import type { Project } from "@/lib/github";

/**
 * Fallback project list, used when the GitHub API is unreachable or
 * rate-limited at build/request time. This data mirrors the real public
 * repositories on https://github.com/rakexhs as of the last successful fetch —
 * nothing here is fabricated.
 */

export const fallbackProjects: Project[] = [
  {
    name: "lexsearch-evalbench",
    title: "LexSearch EvalBench",
    description:
      "Production-grade RAG evaluation bench — hybrid retrieval (BM25 + dense + rerank), citation faithfulness, and Recall@K / MRR / nDCG ablations. Runs locally, no API key required.",
    language: "Python",
    url: "https://github.com/rakexhs/lexsearch-evalbench",
    homepage: null,
    stars: 1,
    pushedAt: "2026-06-30T04:25:15Z",
    topics: ["rag", "retrieval", "evaluation", "bm25", "rerank"],
    featured: true,
    domain: "AI / Retrieval Systems",
  },
  {
    name: "RouteWise",
    title: "RouteWise",
    description:
      "OpenAI-compatible multi-model LLM gateway with semantic caching, fallbacks, cost tracking, and observability.",
    language: "Python",
    url: "https://github.com/rakexhs/RouteWise",
    homepage: null,
    stars: 0,
    pushedAt: "2026-06-30T19:32:29Z",
    topics: ["llm", "gateway", "caching", "observability"],
    featured: false,
    domain: "AI / LLM Infrastructure",
  },
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
    featured: false,
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
