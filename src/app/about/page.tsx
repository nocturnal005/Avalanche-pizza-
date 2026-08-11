import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { Icon } from '@/components/ui/Icon';
import { about } from '@/content/about';
import { image } from '@/content/images';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Crafted in Bechem. Made for good times. Avalanche Pizza is a contemporary pizza brand built for a new generation of pizza lovers.',
  alternates: { canonical: '/about' },
  openGraph: {
    url: '/about',
    title: 'About Us | Avalanche Pizza',
    description: 'Crafted in Bechem. Made for good times.',
  },
};

/**
 * Built from the Stitch export Frank supplied
 * (design/stitch-exports/about-us-v2.html + previews/page-about-us.png).
 *
 * Three numbered chapters: a full-bleed hero, the story told across a 4/7
 * split with a drop-capped opening paragraph, the two-up team portraits with
 * the second offset downward, and a centred philosophy statement.
 */
export default function AboutPage() {
  const { hero, story, team, philosophy } = about;

  return (
    <>
      <SiteHeader active="about" />
      <main id="main" className="w-full bg-background pt-28 lg:pt-20">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative flex min-h-[420px] w-full items-center justify-center overflow-hidden px-4 py-20 md:h-[60vh] md:min-h-[500px] md:px-margin-desktop">
          {/* The looping hero video — owner-supplied, re-encoded to 1.43 MB
              (720p24 H.264 two-pass 1200kbps, audio stripped, faststart).
              Rendered as raw markup because React omits the `muted` attribute
              from server-rendered HTML, and without it in the parsed document
              mobile browsers refuse to autoplay — this page must move even
              when JavaScript is late or absent. Muted + playsinline are the
              autoplay contract.

              NO POSTER, AND NO STILL IMAGE BEHIND IT (owner, 2026-08-11).
              Both used to point at `about-hero`, so the photograph painted
              first and was then replaced by the video a moment later — a
              visible flash on every load. The section's own dark background
              now covers that gap instead, which reads as the video fading up
              rather than as one picture swapping for another.
              `preload="auto"` shortens the gap by fetching the video
              immediately rather than waiting past its metadata.

              The reduced-motion fallback moved to CSS (globals.css,
              `.hero-video-fallback`): a background-image inside the
              prefers-reduced-motion media query is only ever fetched by
              browsers that match it, so the still costs nothing — not even a
              request — for everyone else. That is the whole point; a hidden
              <img> would still have downloaded. */}
          <div
            className="hero-video-fallback absolute inset-0"
            aria-hidden="true"
            // Just a string until a reduced-motion browser reads it. Declaring
            // the URL here rather than in the stylesheet keeps the hashed asset
            // path resolved by the bundler instead of hand-written.
            style={{ '--hero-fallback': `url(${image(hero.image).src})` } as React.CSSProperties}
            dangerouslySetInnerHTML={{
              __html: `<video class="h-full w-full object-cover object-center motion-reduce:hidden" autoplay loop muted playsinline preload="auto" disablepictureinpicture disableremoteplayback><source src="/videos/about-hero-2.mp4" type="video/mp4"/></video>`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <h1 className="animate-fade-up delay-100 font-display-lg text-[30px] uppercase leading-none tracking-[0.15em] text-on-surface drop-shadow-2xl sm:text-[40px] md:text-display-lg">
              {hero.title}
            </h1>
            <div className="animate-fade-up delay-200 mb-2 h-1 w-16 bg-primary" />
            <p className="animate-fade-up delay-300 max-w-2xl font-label-caps text-label-caps uppercase tracking-[0.3em] text-primary-fixed">
              {hero.tagline}
            </p>
          </div>
        </section>

        {/* ── 01 Our Story ─────────────────────────────────────────────── */}
        <section className="relative z-20 w-full bg-background px-4 py-20 md:px-margin-desktop md:py-32">
          <div className="mx-auto grid max-w-container-max grid-cols-1 gap-gutter md:grid-cols-12">
            {/* The export splits this 4 / 1 / 7. At that ratio the photograph
                is visually outweighed by a very long column of copy, so the
                image column is widened to 5 and the text narrowed to 6 —
                a deliberate departure from the export, at Frank's direction. */}
            <div className="reveal flex flex-col gap-8 md:col-span-5">
              <div className="flex items-center gap-4">
                <span className="font-label-caps text-label-caps tracking-[0.2em] text-primary [writing-mode:vertical-rl] rotate-180">
                  {story.index}
                </span>
                <h2 className="font-display-lg text-headline-lg-mobile uppercase leading-tight tracking-[0.1em] text-on-surface md:text-headline-lg">
                  {story.heading[0]}
                  <br />
                  {story.heading[1]}
                </h2>
              </div>

              <div className="group relative aspect-square w-full overflow-hidden rounded-sm shadow-2xl md:aspect-[3/4]">
                <Image
                  src={image(story.image)}
                  alt={story.imageAlt}
                  fill
                  quality={85}
                  sizes="(max-width: 767px) 100vw, 512px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            </div>

            <div className="hidden md:col-span-1 md:block" />

            <div className="reveal reveal-d1 mt-10 flex flex-col justify-center gap-8 md:col-span-6 md:mt-0">
              <div className="max-w-3xl space-y-6 font-body-lg text-body-md font-light leading-relaxed text-on-surface-variant md:text-body-lg md:text-justify">
                {story.paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? 'first-letter:float-left first-letter:mr-2 first-letter:font-display-lg first-letter:text-5xl first-letter:text-primary'
                        : undefined
                    }
                  >
                    {paragraph}
                  </p>
                ))}

                <p className="mt-8 block font-label-caps text-sm uppercase tracking-[0.2em] text-primary">
                  {story.missionLabel}
                </p>
                <p className="border-l-2 border-primary pl-6 italic text-on-surface">
                  {story.mission}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 02 The Team ──────────────────────────────────────────────── */}
        <section className="relative w-full border-y border-outline/10 bg-surface-container-low px-4 py-20 md:px-margin-desktop md:py-32">
          <div className="mx-auto flex max-w-container-max flex-col gap-12 md:gap-16">
            <div className="reveal flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="font-label-caps text-label-caps tracking-[0.2em] text-primary">
                    {team.index}
                  </span>
                  <div className="h-px w-12 bg-outline-variant" />
                </div>
                <h2 className="font-display-lg text-headline-lg-mobile uppercase leading-tight tracking-[0.1em] text-on-surface md:text-headline-lg">
                  {team.headingLead}
                  <br />
                  <span className="text-primary">{team.headingAccent}</span>
                </h2>
              </div>
              <p className="max-w-sm font-body-md text-body-md font-light text-on-surface-variant md:text-right">
                {team.intro}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
              {team.members.map((member, i) => (
                <figure
                  key={member.name}
                  className={`reveal reveal-d${i + 1} group relative aspect-square overflow-hidden rounded-sm bg-surface-container-high shadow-2xl md:aspect-[4/5] ${
                    i === 1 ? 'md:mt-16' : ''
                  }`}
                >
                  <Image
                    src={image(member.image)}
                    alt={member.imageAlt}
                    fill
                    quality={85}
                    sizes="(max-width: 767px) 100vw, 560px"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />
                  <figcaption className="absolute bottom-0 left-0 flex w-full flex-col gap-2 p-6 md:p-8">
                    <span className="font-display-lg text-headline-lg-mobile uppercase tracking-[0.15em] text-on-surface">
                      {member.name}
                    </span>
                    <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
                      {member.role}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Brand Philosophy ──────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden bg-background px-4 py-20 md:px-margin-desktop md:py-32">
          <div className="reveal relative z-10 mx-auto flex max-w-4xl flex-col gap-10 text-center md:gap-12">
            <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-outline">
              {philosophy.index}
            </span>

            <h2 className="font-display-lg text-[28px] uppercase leading-none tracking-[0.08em] text-on-surface sm:text-[38px] md:text-display-lg">
              {philosophy.headingLead}{' '}
              <span className="italic text-primary">{philosophy.headingItalic}</span>,
              <br />
              {philosophy.headingMid}{' '}
              <span className="text-primary">{philosophy.headingAccent}</span>.
            </h2>

            <div className="mx-auto max-w-2xl space-y-6 font-body-lg text-body-md font-light leading-relaxed text-on-surface-variant md:text-body-lg">
              <p>{philosophy.body}</p>
            </div>

            <div className="pt-4 md:pt-8">
              <Link
                href="/menu"
                className="shine group inline-flex items-center justify-center rounded-sm bg-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-primary transition-colors duration-300 hover:bg-primary-fixed hover:text-on-primary-fixed"
              >
                {philosophy.ctaLabel}
                <Icon
                  name="arrow_forward"
                  className="ml-2 size-[18px] transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
