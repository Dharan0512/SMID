"use client";

import { useRef, useState, MouseEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  Variants,
  MotionValue,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Phone,
  MapPin,
  Clock,
  Plus,
} from "lucide-react";

import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import MagneticButton from "@/components/MagneticButton";

// WebGL must stay out of SSR — it touches `window`/WebGL at module load.
const MaterialGallery = dynamic(() => import("@/components/MaterialGallery"), {
  ssr: false,
});

/* -------------------------------------------------------------------------- */
/*                                    Data                                     */
/* -------------------------------------------------------------------------- */

const projects = [
  {
    id: "01",
    title: "Lavender Modular Kitchen",
    category: "Modular Kitchen",
    location: "Vadapalani",
    image: "/media/smidworkimage1.webp",
    span: "lg:col-span-7 lg:row-span-2",
    aspect: "aspect-[4/5]",
  },
  {
    id: "02",
    title: "Fluted Wardrobe & Dresser",
    category: "Bedroom Joinery",
    location: "Anna Nagar",
    image: "/media/smidworkimage2.webp",
    span: "lg:col-span-5",
    aspect: "aspect-[4/3]",
  },
  {
    id: "03",
    title: "Heritage Pooja Unit",
    category: "Bespoke Woodwork",
    location: "T. Nagar",
    image: "/media/smidworkimage3.webp",
    span: "lg:col-span-5",
    aspect: "aspect-[4/3]",
  },
  {
    id: "04",
    title: "Seafoam Shaker Wardrobe",
    category: "Wardrobe Design",
    location: "Porur",
    image: "/media/smidworkimage4.webp",
    span: "lg:col-span-6",
    aspect: "aspect-[16/10]",
  },
  {
    id: "05",
    title: "Graphite & Oak Wardrobe Wall",
    category: "Master Suite",
    location: "Kodambakkam",
    image: "/media/smidworkimage5.webp",
    span: "lg:col-span-6",
    aspect: "aspect-[16/10]",
  },
];

const reviews = [
  {
    name: "Radha Krishnan L",
    meta: "Local Guide · 108 reviews",
    text: "One of the very few excellent interiors I had come across in my 40 years of professional experience setting up more than 150 showrooms. Extraordinary quality, completed as per commitment.",
  },
  {
    name: "Sankar T.",
    meta: "4 reviews",
    text: "I worked with SMID to redesign my home, and the results are amazing! Professional, creative, and they truly listened — all while staying on budget and on time.",
  },
  {
    name: "Ramesh Gopalan",
    meta: "1 review",
    text: "Really happy with the carpenter's work! The finishing is neat, the craftsmanship excellent. Punctual, professional, and listened carefully to what I wanted.",
  },
  {
    name: "Vaishnavi Seetharaman",
    meta: "10 reviews",
    text: "Very neat work, and very patient to accommodate custom requests during the work. Really liked the outcome. Will any day recommend them for woodwork and interiors.",
  },
  {
    name: "Srinivasan MV",
    meta: "9 reviews · 2 photos",
    text: "Their work is perfect. The owner is a courteous person. They also provide good after-completion support.",
  },
  {
    name: "Aparna Ganesan",
    meta: "3 reviews",
    text: "Amazing work done by the team. Very accommodative, adjusting and neat work.",
  },
];

/* -------------------------------------------------------------------------- */
/*                              Shared variants                               */
/* -------------------------------------------------------------------------- */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_OUT },
  },
};

const charContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const charVariant: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 0.85, ease: EASE_OUT },
  },
};

/* -------------------------------------------------------------------------- */
/*                          Smooth-scroll anchor helper                        */
/* -------------------------------------------------------------------------- */

/**
 * Native `#hash` anchors don't work here: the page content lives inside the
 * `position: fixed` SmoothScroll layer, so a section's document offset is ~0.
 * Instead we compute the section's true scroll position — its on-screen top
 * plus the current smoothed scroll offset (published as `--smooth-scroll`) —
 * and set the real scrollY. The SmoothScroll spring then glides to it.
 */
function scrollToSection(id: string) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;

  const smooth =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--smooth-scroll"
      )
    ) || 0;

  const top = el.getBoundingClientRect().top + smooth;
  window.scrollTo({ top: Math.max(top, 0), behavior: "auto" });
}

/* -------------------------------------------------------------------------- */
/*                       Character-by-character reveal                         */
/* -------------------------------------------------------------------------- */

function RevealHeading({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <motion.span
      variants={charContainer}
      initial="hidden"
      animate="visible"
      transition={{ delayChildren: delay }}
      className={className}
      aria-label={text}
    >
      {words.map((word, wi) => (
        <span
          key={wi}
          className="inline-block overflow-hidden whitespace-nowrap align-bottom"
        >
          {word.split("").map((char, ci) => (
            <motion.span
              key={ci}
              variants={charVariant}
              className="inline-block"
              aria-hidden
            >
              {char}
            </motion.span>
          ))}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Nav                                      */
/* -------------------------------------------------------------------------- */

function Nav() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: EASE_OUT, delay: 0.3 }}
      className="fixed inset-x-0 top-0 z-50 mix-blend-difference"
    >
      <nav className="flex items-center justify-between px-6 py-6 text-bone md:px-12">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("top");
          }}
          className="font-serif text-xl tracking-tightest"
        >
          SMID<span className="text-clay">.</span>
        </a>
        <ul className="hidden gap-10 font-sans text-[11px] uppercase tracking-[0.25em] md:flex">
          {["Work", "Philosophy", "Reviews", "Contact"].map((item) => {
            const id = item.toLowerCase();
            return (
              <li key={item}>
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(id);
                  }}
                  className="transition-opacity duration-300 hover:opacity-60"
                >
                  {item}
                </a>
              </li>
            );
          })}
        </ul>
        <a
          href="tel:07092445892"
          className="font-sans text-[11px] uppercase tracking-[0.25em]"
        >
          070924 45892
        </a>
      </nav>
    </motion.header>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Hero                                      */
/* -------------------------------------------------------------------------- */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax: the image expands and drifts as the section scrolls away.
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const overlayY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative grid min-h-screen grid-cols-1 gap-8 px-6 pb-16 pt-32 md:px-12 lg:grid-cols-12 lg:gap-6 lg:pt-40"
    >
      {/* Left column — headline */}
      <div className="z-10 flex flex-col justify-between lg:col-span-7">
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8 flex items-center gap-4 font-sans text-[11px] uppercase tracking-[0.3em] text-stone"
          >
            <span className="h-px w-12 bg-clay" />
            Interior Decorators — Chennai, since 2018
          </motion.div>

          <h1 className="font-serif text-[14vw] font-light leading-[0.92] tracking-tightest text-ink md:text-[10.5vw] lg:text-[8.5vw]">
            <RevealHeading text="Crafted" className="block" delay={0.2} />
            <RevealHeading
              text="Interiors"
              className="block italic text-clay"
              delay={0.4}
            />
            <span className="flex items-end gap-4">
              <RevealHeading text="for life" className="block" delay={0.6} />
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8, ease: EASE_OUT }}
                className="mb-3 hidden h-[0.5em] w-[0.5em] rounded-full bg-ink md:block"
              />
            </span>
          </h1>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1, duration: 0.9, ease: EASE_OUT }}
          className="mt-12 flex max-w-md flex-col gap-6"
        >
          <p className="font-sans text-base leading-relaxed text-graphite">
            Sree Mahalakshmi Interior Decorators — bespoke modular kitchens,
            wardrobes and fine woodwork, built with obsessive craft in
            Vadapalani.
          </p>
          <MagneticButton
            as="a"
            href="#work"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("work");
            }}
            className="group inline-flex items-center gap-3 self-start rounded-full bg-ink px-7 py-4 font-sans text-[11px] uppercase tracking-[0.25em] text-bone"
          >
            <span className="flex items-center gap-3">
              View our work
              <ArrowDownRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
            </span>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Right column — parallax expanding image */}
      <motion.div
        initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
        transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.5 }}
        className="relative h-[60vh] overflow-hidden rounded-[2px] lg:col-span-5 lg:h-auto"
      >
        <motion.div
          style={{ scale: imageScale, y: imageY }}
          className="absolute inset-0 h-full w-full will-change-transform"
        >
          <Image
            src="/media/smidworkimage1.webp"
            alt="Bespoke lavender modular kitchen by SMID"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover"
          />
        </motion.div>

        <motion.div
          style={{ y: overlayY }}
          className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-bone"
        >
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] opacity-80">
              Featured project
            </p>
            <p className="font-serif text-2xl">Lavender Kitchen</p>
          </div>
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] opacity-80">
            01 / 05
          </span>
        </motion.div>
      </motion.div>

      {/* Marquee strip */}
      <div className="lg:col-span-12">
        <Marquee />
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Modular Kitchens",
    "Wardrobes",
    "Pooja Units",
    "TV Units",
    "Full Home Interiors",
    "Bespoke Joinery",
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 1 }}
      className="mt-12 flex gap-6 overflow-hidden border-y border-ink/10 py-5"
    >
      <motion.div
        className="flex shrink-0 gap-6"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-6 whitespace-nowrap font-serif text-2xl text-stone md:text-3xl"
          >
            {item}
            <Plus className="h-4 w-4 text-clay" />
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           Philosophy (kinetic text)                        */
/* -------------------------------------------------------------------------- */

function PhilosophyWord({
  children,
  range,
  progress,
}: {
  children: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

function Philosophy() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });

  const paragraph =
    "We believe a home is not decorated, it is composed. Every joint, every grain of wood and every line of light is considered, so the spaces we build feel inevitable — quietly luxurious, and entirely yours.";
  const words = paragraph.split(" ");

  return (
    <section
      ref={ref}
      id="philosophy"
      className="relative px-6 py-32 md:px-12 md:py-48"
    >
      <div className="mb-16 flex items-center gap-4 font-sans text-[11px] uppercase tracking-[0.3em] text-stone">
        <span className="h-px w-12 bg-clay" />
        Our Philosophy
      </div>
      <p className="max-w-5xl font-serif text-[7vw] font-light leading-[1.15] tracking-tight text-ink md:text-[3.8vw]">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <PhilosophyWord
              key={i}
              range={[start, end]}
              progress={scrollYProgress}
            >
              {word}
            </PhilosophyWord>
          );
        })}
      </p>

      <div className="mt-24 grid grid-cols-1 gap-12 border-t border-ink/10 pt-12 md:grid-cols-3">
        {[
          { k: "07+", v: "Years of bespoke craft" },
          { k: "150+", v: "Homes & showrooms delivered" },
          { k: "100%", v: "On-commitment completion" },
        ].map((stat, i) => (
          <motion.div
            key={stat.k}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.12 }}
          >
            <p className="font-serif text-6xl tracking-tightest text-ink md:text-7xl">
              {stat.k}
            </p>
            <p className="mt-3 font-sans text-sm text-graphite">{stat.v}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                      Featured projects + magnetic cards                     */
/* -------------------------------------------------------------------------- */

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Floating "View Case Study" button that tracks the cursor inside the card.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { damping: 20, stiffness: 250, mass: 0.3 });
  const ySpring = useSpring(y, { damping: 20, stiffness: 250, mass: 0.3 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={`group relative ${project.span}`}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative w-full cursor-none overflow-hidden rounded-[2px] bg-sand ${project.aspect}`}
      >
        <motion.div
          className="absolute inset-0 h-full w-full"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>

        {/* Darkening veil on hover */}
        <motion.div
          className="absolute inset-0 bg-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 0.25 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Cursor-following magnetic button */}
        <motion.div
          style={{ x: xSpring, y: ySpring }}
          className="pointer-events-none absolute left-0 top-0 z-20 -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: hovered ? 1 : 0,
              opacity: hovered ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="flex h-28 w-28 items-center justify-center rounded-full bg-bone text-center font-sans text-[10px] uppercase leading-tight tracking-[0.2em] text-ink"
          >
            View
            <br />
            Case Study
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </motion.div>
        </motion.div>
      </div>

      {/* Caption */}
      <div className="mt-5 flex items-start justify-between">
        <div>
          <h3 className="font-serif text-2xl tracking-tight text-ink md:text-3xl">
            {project.title}
          </h3>
          <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.25em] text-stone">
            {project.category} — {project.location}
          </p>
        </div>
        <span className="font-sans text-[11px] tracking-[0.25em] text-stone">
          {project.id}
        </span>
      </div>
    </motion.div>
  );
}

function FeaturedWork() {
  return (
    <section id="work" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="mb-6 flex items-center gap-4 font-sans text-[11px] uppercase tracking-[0.3em] text-stone">
            <span className="h-px w-12 bg-clay" />
            Selected Work
          </div>
          <h2 className="font-serif text-[12vw] font-light leading-none tracking-tightest text-ink md:text-[6vw]">
            Featured projects
          </h2>
        </div>
        <p className="max-w-xs font-sans text-sm leading-relaxed text-graphite">
          A selection of recent residences across Chennai — each one designed,
          fabricated and installed entirely in-house.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-16 lg:grid-cols-12">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Reviews                                    */
/* -------------------------------------------------------------------------- */

function Reviews() {
  return (
    <section
      id="reviews"
      className="border-t border-ink/10 bg-sand px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <h2 className="font-serif text-[12vw] font-light leading-none tracking-tightest text-ink md:text-[5vw]">
          Loved on Google
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-clay text-clay" />
            ))}
          </div>
          <span className="font-sans text-sm text-graphite">
            5.0 — verified reviews
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, i) => (
          <motion.figure
            key={review.name}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: (i % 3) * 0.1 }}
            whileHover={{ y: -6 }}
            className="flex flex-col justify-between rounded-[2px] border border-ink/10 bg-bone p-8 transition-colors duration-300 hover:border-ink/30"
          >
            <div>
              <div className="mb-5 flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-clay text-clay" />
                ))}
              </div>
              <blockquote className="font-serif text-lg leading-relaxed text-graphite">
                “{review.text}”
              </blockquote>
            </div>
            <figcaption className="mt-8 border-t border-ink/10 pt-5">
              <p className="font-sans text-sm font-medium text-ink">
                {review.name}
              </p>
              <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.2em] text-stone">
                {review.meta}
              </p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Experience — WebGL material gallery                   */
/* -------------------------------------------------------------------------- */

function Experience() {
  return (
    <section
      id="experience"
      className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-sand via-bone to-sand"
    >
      {/* Layer 1 — the R3F canvas sits behind everything (transparent alpha). */}
      <div className="absolute inset-0 z-0">
        <MaterialGallery />
      </div>

      {/* Layer 2 — HTML/Tailwind text overlay. `pointer-events-none` lets the
          cursor reach the canvas so slabs stay hoverable; interactive children
          opt back in with `pointer-events-auto`. `mix-blend-difference` keeps
          the headline legible over both light slabs and dark shadows. */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-6 font-sans text-[11px] uppercase tracking-[0.3em] text-stone"
        >
          The Material Library
        </motion.p>

        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl font-serif text-[12vw] font-light leading-[0.95] tracking-tightest text-ink mix-blend-difference md:text-[6vw]"
        >
          Texture, light <span className="italic text-clay">&amp; space</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 max-w-md font-sans text-sm leading-relaxed text-graphite"
        >
          A living library of the finishes we work in — laminate, veneer,
          marble and lacquer. Drag your cursor through the slabs; hover to bring
          one forward.
        </motion.p>
      </div>

      {/* Bottom hint */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 font-sans text-[10px] uppercase tracking-[0.3em] text-stone">
        Move · Hover · Explore
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Footer                                     */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-ink px-6 pb-12 pt-28 text-bone md:px-12 md:pt-40"
    >
      <div className="flex flex-col items-center text-center">
        <p className="mb-10 font-sans text-[11px] uppercase tracking-[0.3em] text-bone/50">
          Have a space in mind?
        </p>
        <h2 className="font-serif text-[16vw] font-light leading-[0.9] tracking-tightest md:text-[11vw]">
          Let&rsquo;s build it
        </h2>

        <div className="my-16">
          <MagneticButton
            as="a"
            href="tel:07092445892"
            strength={0.5}
            className="group flex h-44 w-44 items-center justify-center rounded-full border border-bone/30 font-sans text-xs uppercase tracking-[0.25em] text-bone md:h-56 md:w-56"
          >
            <span className="flex flex-col items-center gap-2">
              <ArrowUpRight className="h-6 w-6 transition-transform duration-300 group-hover:rotate-45" />
              Get in touch
            </span>
          </MagneticButton>
        </div>
      </div>

      {/* Contact grid */}
      <div className="grid grid-cols-1 gap-10 border-t border-bone/15 pt-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-serif text-2xl tracking-tightest">
            SMID<span className="text-clay">.</span>
          </p>
          <p className="mt-3 font-sans text-sm text-bone/60">
            Sree Mahalakshmi Interior Decorators
          </p>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="mt-1 h-4 w-4 shrink-0 text-clay" />
          <p className="font-sans text-sm leading-relaxed text-bone/70">
            No. 7/2, North, 2nd St,
            <br />
            Vadapalani, Chennai,
            <br />
            Tamil Nadu 600026
          </p>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="mt-1 h-4 w-4 shrink-0 text-clay" />
          <a
            href="tel:07092445892"
            className="font-sans text-sm text-bone/70 transition-colors hover:text-bone"
          >
            070924 45892
          </a>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="mt-1 h-4 w-4 shrink-0 text-clay" />
          <p className="font-sans text-sm leading-relaxed text-bone/70">
            Open today
            <br />
            Closes 7:00 PM
          </p>
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-bone/15 pt-8 font-sans text-[11px] uppercase tracking-[0.2em] text-bone/40 md:flex-row">
        <span>© {new Date().getFullYear()} SMID — Chennai</span>
        <span>Crafted interiors for life</span>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                      */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const [revealed, setRevealed] = useState(false);

  return (
    <>
      <Preloader onComplete={() => setRevealed(true)} />

      <Nav />

      <SmoothScroll>
        <motion.main
          initial={{ opacity: 0, scale: 1.04 }}
          animate={revealed ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, ease: EASE_OUT }}
          className="bg-bone"
        >
          <Hero />
          <Philosophy />
          <Experience />
          <FeaturedWork />
          <Reviews />
          <Footer />
        </motion.main>
      </SmoothScroll>
    </>
  );
}
