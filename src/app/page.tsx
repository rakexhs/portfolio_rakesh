import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Journey from "@/components/sections/Journey";
import Contact from "@/components/sections/Contact";
import { getProjects } from "@/lib/github";

export default async function Home() {
  // Server-side fetch with hourly revalidation; falls back to snapshot data.
  const projects = await getProjects();

  return (
    <>
      <Hero />
      <Projects projects={projects} />
      <About />
      <Skills />
      <Journey />
      <Contact />
    </>
  );
}
