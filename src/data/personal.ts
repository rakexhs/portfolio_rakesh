export const personal = {
  name: "Rakesh Saraswat",
  firstName: "Rakesh",
  lastName: "Saraswat",
  role: "Software Engineer",
  location: "Long Beach, CA",
  email: "rgsaraswat2002@gmail.com",
  github: "https://github.com/rakexhs",
  githubUser: "rakexhs",
  linkedin: "https://www.linkedin.com/in/rakesh-saraswat-907a3b233",
  tagline:
    "Building sharp, interactive software experiences across modern web, systems, and AI-driven products.",
  availability: "Available for internships",
  about: {
    intro:
      "I'm a software engineer based in Long Beach, focused on building user-facing systems that feel fast, intentional, and engaging.",
    body: [
      "My work sits at the intersection of frontend engineering, product thinking, and applied AI. I care about the details most people scroll past — the timing of a transition, the latency of a request, the structure of the code underneath.",
      "Right now I'm exploring interactive web experiences, LLM-powered applications, and full-stack products — writing clean, scalable code and shipping interfaces that hold up under real use.",
    ],
    interests: [
      "Interactive Web",
      "Creative Frontend/Backend",
      "AI / LLM Applications",
      "Full-Stack Products",
      "Systems Thinking",
    ],
  },
  journey: [
    {
      index: "01",
      title: "Foundations",
      body: "Built a base in core software engineering — data structures, web fundamentals, and shipping complete projects end to end.",
      tags: ["JavaScript", "Node.js", "Full-Stack"],
    },
    {
      index: "02",
      title: "Full-Stack Builds",
      body: "Designed and shipped complete web applications — booking platforms, prediction tools, and personal products — owning everything from data layer to UI.",
      tags: ["MERN", "REST APIs", "Tailwind CSS"],
    },
    {
      index: "03",
      title: "Applied AI & Systems",
      body: "Moved deeper into AI-driven engineering: synthetic image verification, LLM latency analysis, and tooling that measures how models actually behave.",
      tags: ["Python", "LLMs", "Computer Vision"],
    },
    {
      index: "04",
      title: "Now",
      body: "Building projects across software engineering, interactive web development, and AI-powered applications — and looking for an internship where that energy compounds.",
      tags: ["Next.js", "Python", "C++", "Algorithms"],
    },
  ],
  skills: {
    core: [
      "TypeScript",
      "JavaScript",
      "React",
      "Next.js",
      "Node.js",
      "Python",
      "C++",
      "Algorithms",
      "Data Structures",
      "Machine Learning",
      "Deep Learning",
      "Natural Language Processing",
    ],
    frontend: [
      "HTML",
      "CSS",
      "Tailwind CSS",
      "Electron.js",
      "Three.js",
      "Responsive Design",
      "Frontend Engineering",
    ],
    engineering: [
      "Git",
      "GitHub",
      "REST APIs",
      "SQL",
      "Express",
      "MongoDB",
      "Software Engineering",
    ],
    exploring: [
      "AI / LLM Applications",
      "Computer Vision",
      "WebGL / GLSL",
      "Model Latency Analysis",
      "Jupyter / Notebooks",
    ],
  },
} as const;

export const navLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
] as const;
