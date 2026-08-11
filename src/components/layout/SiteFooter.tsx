import Image from 'next/image';

import phoenix from '@/assets/images/brand-phoenix.png';
import slice from '@/assets/images/brand-slice.jpg';
import facebook from '@/assets/images/social-facebook.png';
import instagram from '@/assets/images/social-instagram.png';
import tiktok from '@/assets/images/social-tiktok.png';

import { SHOP } from '@/config/shop';
import { CallLink } from '@/components/order/CallLink';
import { OrderCta } from '@/components/order/OrderCta';
import { buildGeneralMessage } from '@/lib/whatsapp';

/**
 * The footer exactly as designed: full-bleed, three columns —
 *   1. brand lockup + blurb
 *   2. "Connect" + the three social marks
 *   3. Location + copyright
 *
 * Copy, structure and classes are verbatim from the exports. Two additions
 * are marked inline: the WhatsApp/call links under "Connect", and the phone
 * number as selectable text under the address. Ordering is the site's whole
 * purpose and the designs predate that decision — remove them if you would
 * rather keep the footer purely as drawn.
 */

const SOCIAL_ICONS = { Facebook: facebook, Instagram: instagram, TikTok: tiktok } as const;

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-outline-variant bg-surface-container-lowest py-margin-desktop">
      <div className="w-full px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 items-start gap-gutter md:grid-cols-3">
          {/* 1 — brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-headline-lg text-body-lg uppercase tracking-[0.1em] text-on-surface">
                <Image
                  src={phoenix}
                  alt=""
                  className="mr-2 inline-block h-8 w-auto align-middle"
                  style={{ mixBlendMode: 'screen' }}
                  sizes="64px"
                />
                Avalanche
                <Image
                  src={slice}
                  alt=""
                  className="ml-2 inline-block h-8 w-auto align-middle"
                  style={{ mixBlendMode: 'screen' }}
                  sizes="64px"
                />
              </span>
            </div>
            <p className="max-w-xs font-body-md text-body-md text-on-surface-variant">
              Great pizza begins long before it reaches the oven. Carefully prepared dough, quality
              ingredients and patient technique form the foundation of every Avalanche pizza.
            </p>
          </div>

          {/* 2 — Connect */}
          <div className="flex flex-col items-start gap-4 md:items-center">
            <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
              Connect
            </span>

            <div className="flex gap-unit">
              {SHOP.socials.map((social) => {
                const icon = SOCIAL_ICONS[social.name as keyof typeof SOCIAL_ICONS];
                const mark = (
                  <Image
                    src={icon}
                    alt={social.name}
                    className="h-6 w-6 object-contain"
                    style={{ mixBlendMode: 'screen' }}
                    sizes="24px"
                  />
                );
                // Only becomes a link once a real URL exists (see config/shop.ts).
                return social.href ? (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  >
                    {mark}
                  </a>
                ) : (
                  <span key={social.name}>{mark}</span>
                );
              })}
            </div>

            {/* Addition: the ordering channels. */}
            <div className="flex flex-col items-start gap-2 md:items-center">
              <OrderCta message={buildGeneralMessage('web/footer')} variant="bare">
                Order on WhatsApp
              </OrderCta>
              <CallLink variant="bare" />
            </div>
          </div>

          {/* 3 — Location */}
          <div className="flex h-full flex-col justify-between gap-4 md:text-right">
            <div>
              <p className="mb-4 font-body-md text-body-md text-on-surface-variant">
                Location: {SHOP.addressLines.join(', ')}.
              </p>
              {/* Addition: plain, selectable — the fallback that always works,
                  for anyone without WhatsApp or a tel: handler. */}
              <p className="font-label-caps text-label-caps tabular text-on-surface-variant">
                {SHOP.phoneDisplay}
              </p>
            </div>
            <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant">
              © 2026 Avalanche Pizza. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
