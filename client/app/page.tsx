"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  NotebookPen,
  FileText,
  Headphones,
  Link2,
  Video,
  Quote,
  Volume2,
  ListTree,
  Layers,
  Menu,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/theme-toggler";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Hero visual: sources flowing into the notebook as animated beams
// ---------------------------------------------------------------------------

function SourceBeam() {
  const shouldReduceMotion = useReducedMotion();

  const sources = [
    { icon: FileText, label: "PDF", pos: "top-0 left-0" },
    { icon: Headphones, label: "Audio", pos: "top-0 right-0" },
    { icon: Link2, label: "Web page", pos: "bottom-0 left-0" },
    { icon: Video, label: "Video", pos: "bottom-0 right-0" },
  ];

  const paths = [
    "M56,56 Q150,150 200,200",
    "M344,56 Q250,150 200,200",
    "M56,344 Q150,250 200,200",
    "M344,344 Q250,250 200,200",
  ];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient
            id="beamGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="oklch(66.02% 0.22929 100.336)"
              stopOpacity="0"
            />

            <stop
              offset="100%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0.85"
            />
          </linearGradient>
        </defs>

        {paths.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke="url(#beamGrad)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="4 7"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    strokeDashoffset: [0, -66],
                  }
            }
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.3,
            }}
          />
        ))}
      </svg>

      {/* Central glowing effect */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-2xl"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.55, 0.3],
              }
        }
        transition={{
          duration: 3.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Central notebook card */}
      <div className="absolute left-1/2 top-1/2 w-44 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-muted p-4 shadow-2xl">
        <div className="flex items-center gap-2 text-foreground">
          <NotebookPen className="h-4 w-4" />

          <span className="text-xs font-medium">
            Your notebook
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-[#1B1B18]/10" />
          <div className="h-1.5 w-4/5 rounded-full bg-[#1B1B18]/10" />
          <div className="h-1.5 w-3/5 rounded-full bg-primary/50" />
        </div>

        <Badge className="mt-3 border-transparent bg-accent/15 text-[10px] font-normal text-primary hover:bg-accent/15">
          4 sources cited
        </Badge>
      </div>

      {/* Sources */}
      {sources.map(({ icon: Icon, label, pos }) => (
        <div
          key={label}
          className={`absolute ${pos} flex flex-col items-center gap-1.5`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>

          <span className="text-[10px] text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

const steps = [
  {
    title: "Add your sources",
    desc: "Upload files or paste a link. Quire indexes every page, paragraph, and timestamp as it comes in.",
  },
  {
    title: "Ask, explore, follow up",
    desc: "Chat with your notebook like you would with someone who actually read everything. Every answer points back to where it came from.",
  },
  {
    title: "Turn it into something shareable",
    desc: "Export a briefing, a study guide, or a short audio overview you can send to your team or listen to later.",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function QuireLanding() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-['Inter']">

      {/* ----------------------------------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------------------------------- */}

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-12">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <NotebookPen className="h-5 w-5 text-primary" />

            <span className="font-['Source_Serif_4'] text-lg text-foreground">
              Quire
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a
              href="#product"
              className="transition-colors hover:text-foreground"
            >
              Product
            </a>

            <a
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </a>

            <a
              href="#reviews"
              className="transition-colors hover:text-foreground"
            >
              Reviews
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 sm:flex">
            <ModeToggle />

            <Button
              variant="ghost"
              className="text-foreground hover:bg-accent hover:text-foreground"
            >
              <Link href="/sign-in">
                Sign in
              </Link>
            </Button>

            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Start free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="text-foreground sm:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-border px-6 py-4 sm:hidden">
            <div className="flex flex-col gap-4 text-sm text-muted-foreground">

              <a
                href="#product"
                onClick={() => setMenuOpen(false)}
              >
                Product
              </a>

              <a
                href="#how-it-works"
                onClick={() => setMenuOpen(false)}
              >
                How it works
              </a>

              <a
                href="#reviews"
                onClick={() => setMenuOpen(false)}
              >
                Reviews
              </a>

              <Button className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Start free
              </Button>

            </div>
          </div>
        )}
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Hero */}
      {/* ----------------------------------------------------------------- */}

      <section className="relative overflow-hidden px-6 pb-24 pt-36 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">

          {/* Hero Content */}
          <motion.div
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            <h1 className="font-['Source_Serif_4'] text-4xl leading-[1.12] text-foreground md:text-5xl lg:text-[3.4rem]">
              Every source you have. One notebook that actually read them.
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Drop in your PDFs, papers, recordings, and links. Ask questions
              and get answers grounded in your own material, with the exact
              passage cited every time.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start free
              </Button>

              <Button
                size="lg"
                variant="ghost"
                className="text-foreground hover:bg-accent hover:text-foreground"
              >
                Watch a 2-minute tour
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              No credit card. Cancel anytime.
            </p>
          </motion.div>

          {/* Hero Animation */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
              delay: 0.15,
            }}
          >
            <SourceBeam />
          </motion.div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Features */}
      {/* ----------------------------------------------------------------- */}

      <section
        id="product"
        className="border-t border-border px-6 py-24 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">

          <h2 className="font-['Source_Serif_4'] text-3xl text-foreground md:text-4xl">
            What Quire actually does
          </h2>

          <p className="mt-3 max-w-lg text-muted-foreground">
            Four things, done properly, instead of everything done halfway.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-muted/50 md:grid-cols-3">

            {/* Grounded Answers */}
            <div className="col-span-1 flex flex-col gap-8 bg-background p-10 md:col-span-3 md:flex-row md:items-center">

              <div className="max-w-md">
                <Quote className="h-6 w-6 text-primary" />

                <h3 className="mt-4 text-xl text-foreground">
                  Grounded answers, not guesses
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Ask anything about your sources. Quire quotes the exact line
                  it used, with a link back to the page or timestamp, so you can
                  check its work instead of taking its word for it.
                </p>
              </div>

              <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">
                  You asked
                </p>

                <p className="mt-1 text-sm text-foreground">
                  What did the Q3 report say about churn?
                </p>

                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    Found in Q3-report.pdf, page 6
                  </p>

                  <p className="mt-1 border-l-2 border-primary pl-3 text-sm italic text-muted-foreground">
                    Churn dropped to 2.1%, the lowest in six quarters.
                  </p>
                </div>
              </div>

            </div>

            {/* Listen */}
            <div className="bg-background p-8">
              <Volume2 className="h-5 w-5 text-accent-foreground" />

              <h3 className="mt-4 text-lg text-foreground">
                Listen instead of reading
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Turn a stack of documents into a short spoken conversation you
                can play on a walk or a drive.
              </p>
            </div>

            {/* Study Guide */}
            <div className="bg-background p-8">
              <ListTree className="h-5 w-5 text-accent-foreground" />

              <h3 className="mt-4 text-lg text-foreground">
                From sources to study guide
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Generate outlines, flashcards, and summaries structured around
                what's actually in your material.
              </p>
            </div>

            {/* Existing Sources */}
            <div className="bg-background p-8">
              <Layers className="h-5 w-5 text-accent-foreground" />

              <h3 className="mt-4 text-lg text-foreground">
                Works with what you already have
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                PDFs, Google Docs, websites, audio, video, and pasted text all
                go into the same notebook.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* How It Works */}
      {/* ----------------------------------------------------------------- */}

      <section
        id="how-it-works"
        className="border-t border-border px-6 py-24 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">

          <h2 className="font-['Source_Serif_4'] text-3xl text-foreground md:text-4xl">
            How it works
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title}>
                <span className="font-['Source_Serif_4'] text-4xl text-muted-foreground">
                  0{i + 1}
                </span>

                <h3 className="mt-4 text-lg text-foreground">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Pull Quote */}
      {/* ----------------------------------------------------------------- */}

      <section
        id="reviews"
        className="bg-muted px-6 py-24 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-2xl text-center">

          <p className="font-['Source_Serif_4'] text-2xl italic leading-snug text-foreground md:text-3xl">
            I stopped losing afternoons hunting for which paper said what. Now I
            ask, and it shows me exactly where the answer came from.
          </p>

          <p className="mt-6 text-sm text-muted-foreground">
            A graduate researcher, using Quire for a literature review
          </p>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Final CTA */}
      {/* ----------------------------------------------------------------- */}

      <section className="border-t border-border px-6 py-24 text-center md:px-12">

        <h2 className="font-['Source_Serif_4'] text-3xl text-foreground md:text-4xl">
          Bring your first ten sources.
        </h2>

        <p className="mt-3 text-muted-foreground">
          It's free to start. No credit card.
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Start free
          </Button>
        </div>

      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Footer */}
      {/* ----------------------------------------------------------------- */}

      <footer className="border-t border-border px-6 py-14 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">

              <NotebookPen className="h-5 w-5 text-primary" />

              <span className="font-['Source_Serif_4'] text-lg text-foreground">
                Quire
              </span>

            </div>

            <p className="mt-3 max-w-[220px] text-sm text-muted-foreground">
              A notebook that reads your sources before you do.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-sm text-foreground">
              Product
            </p>

            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">

              <li>
                <a
                  href="#product"
                  className="hover:text-foreground"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-foreground"
                >
                  Pricing
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-foreground"
                >
                  Changelog
                </a>
              </li>

            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-sm text-foreground">
              Company
            </p>

            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">

              <li>
                <a
                  href="#"
                  className="hover:text-foreground"
                >
                  About
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-foreground"
                >
                  Blog
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-foreground"
                >
                  Careers
                </a>
              </li>

            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-sm text-foreground">
              Legal
            </p>

            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">

              <li>
                <a
                  href="#"
                  className="hover:text-foreground"
                >
                  Privacy
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-foreground"
                >
                  Terms
                </a>
              </li>

            </ul>
          </div>

        </div>

        <Separator className="my-10 bg-muted/50" />

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Quire. All rights reserved.
        </p>

      </footer>

    </div>
  );
}