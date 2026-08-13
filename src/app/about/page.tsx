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
          {/* The looping hero video. Rendered as raw markup because React omits
              the `muted` attribute from server-rendered HTML, and without it in
              the parsed document mobile browsers refuse to autoplay — this page
              must move even when JavaScript is late or absent. Muted +
              playsinline are the autoplay contract.

              THE POSTER IS THE VIDEO'S OWN FIRST FRAME (owner, 2026-08-12,
              "remove any latency"). This is the whole trick, and it resolves
              what looked like a contradiction with the earlier "kill the flash"
              request. The original flash was never caused by having a poster —
              it was caused by the poster being a DIFFERENT photograph
              (`about-hero`, the restaurant interior), which painted and was
              then visibly swapped for the video. A poster cut from frame 0 of
              this exact file cannot flash: when playback starts it continues
              from a pixel-identical image, so the handover is invisible.

              What that buys: 24 KB paints in about 0.2s on a 1 Mbps
              connection, against roughly 8s for the video itself. The hero
              shows the chef immediately instead of sitting empty while the
              mp4 streams — and on any device that refuses autoplay outright
              (iOS Low Power Mode, Android Data Saver) the hero is no longer
              blank, which was a real hole in the previous version.

              about-hero-4.mp4 is the same 1280x564 crop that removed the
              generator's AI sparkle watermark (x1150-1205, y570-622 — static
              in all 240 frames, and un-styleable, because object-cover reveals
              more source height as the hero grows, so any CSS trick that hides
              it at one viewport lets it back at another). Re-encoded from
              `avalanche hero video.mp4` at CRF 28 — NOT from -3, so there is
              no second generation of compression. 989 KB against 1.45 MB, a
              34% cut, at SSIM 0.985 versus the file it replaces, which is
              imperceptible on this footage. New filename because /videos/* is
              served immutable for a year; an overwrite would never reach a
              repeat visitor.

              `preload="auto"` still fetches the video immediately; the poster
              simply means nobody is looking at nothing while it arrives.

              The reduced-motion fallback (globals.css `.hero-video-fallback`)
              now points at the same poster rather than the 240 KB
              `about-hero` still: one image for every path, and a tenth of the
              bytes. A background-image inside the prefers-reduced-motion
              query is never fetched by a browser that does not match it, so
              it stays free for everyone else — which a hidden <img> would
              not have been. */}
          <div
            className="hero-video-fallback absolute inset-0"
            aria-hidden="true"
            style={{ '--hero-fallback': 'url(/videos/about-hero-poster-1.webp)' } as React.CSSProperties}
            dangerouslySetInnerHTML={{
              __html: `<video class="h-full w-full object-cover object-center motion-reduce:hidden" autoplay loop muted playsinline preload="auto" poster="/videos/about-hero-poster-1.webp" disablepictureinpicture disableremoteplayback><source src="/videos/about-hero-4.mp4" type="video/mp4"/></video>`,
            }}
          />
          {/* THE FULL-BLEED SCRIM IS GONE (owner, 2026-08-11).
              The Stitch export specifies `from-background via-background/80
              to-background/40` here, and that is right for the still image it
              was drawn around — a heavy veil costs a photograph nothing. Over
              a moving image it is pure loss: measured against the raw frames,
              it was leaving 41% of the light in the middle of the picture and
              17% at the brightest band, which is what read as haze.

              A DELIBERATE DEPARTURE FROM THE EXPORT, at his direction, on the
              same footing as the 5/6 story split below.

              What replaces it is a bottom-only fade: fully transparent above
              32%, so the chef and the whole upper frame are untouched, and
              resolving to the page colour at the very bottom so the hero still
              melts into "01 Our Story" instead of hard-cutting. Text stays
              legible on `.hero-text-shadow` (globals.css) — a shadow darkens
              only the pixels behind the glyphs, where a scrim darkened all of
              them. */}
          <div
            className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-background)_0%,color-mix(in_oklab,var(--color-background)_55%,transparent)_18%,transparent_32%)]"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <h1 className="hero-text-shadow animate-fade-up delay-100 font-display-lg text-[30px] uppercase leading-none tracking-[0.15em] text-on-surface sm:text-[40px] md:text-display-lg">
              {hero.title}
            </h1>
            <div className="animate-fade-up delay-200 mb-2 h-1 w-16 bg-primary" />
            <p className="hero-text-shadow-dense animate-fade-up delay-300 max-w-2xl font-label-caps text-label-caps uppercase tracking-[0.3em] text-primary-fixed">
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
