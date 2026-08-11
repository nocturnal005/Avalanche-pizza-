import Link from 'next/link';
import Image from 'next/image';

import phoenix from '@/assets/images/brand-phoenix.png';
import slice from '@/assets/images/brand-slice.jpg';
import { OrderCta } from '@/components/order/OrderCta';
import { buildGeneralMessage } from '@/lib/whatsapp';

export type ActiveRoute = 'home' | 'about' | 'menu' | 'deals' | 'none';

/**
 * The designed header carried five controls: About Us, Core Menu, Deals, a
 * basket icon with a "0" badge, and a Login button.
 *
 * All three nav tabs are present as designed. About Us points at /about, which
 * is awaiting Frank's design — until it lands the route does not exist.
 *
 * Still withheld:
 *   • the basket — there is no cart, and a basket that opens WhatsApp would
 *     lie about what happens next;
 *   • Login — there are no accounts, and a login form that authenticates
 *     nothing invites people to type a real password into a dead input.
 *
 * An "Order on WhatsApp" control occupies the slot the Login button held,
 * reusing that button's exact treatment: 1px outline, label-caps uppercase,
 * px-6 py-2, primary fill on hover.
 */

const NAV: { href: string; label: string; route: ActiveRoute }[] = [
  { href: '/about', label: 'About Us', route: 'about' },
  { href: '/menu', label: 'Core Menu', route: 'menu' },
  { href: '/deals', label: 'Deals', route: 'deals' },
];

export function SiteHeader({ active = 'none' }: { active?: ActiveRoute }) {
  return (
    <header className="fixed top-0 z-50 w-full bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.2)]">
      {/* Brand row */}
      <div className="flex h-16 w-full items-center justify-between px-margin-mobile lg:h-20 lg:px-margin-desktop">
        <Link
          href="/"
          className="flex items-center font-headline-lg text-body-lg uppercase tracking-[0.2em] text-on-surface transition-colors hover:text-primary"
        >
          <Image
            src={phoenix}
            alt=""
            className="mr-2.5 inline-block h-7 w-auto align-middle lg:h-8"
            style={{ mixBlendMode: 'screen' }}
            priority
            sizes="64px"
          />
          Avalanche
          <Image
            src={slice}
            alt=""
            className="ml-2.5 hidden h-7 w-auto align-middle sm:inline-block lg:h-8"
            style={{ mixBlendMode: 'screen' }}
            priority
            sizes="64px"
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden lg:flex lg:items-center lg:gap-gutter">
          {NAV.map((item) => {
            const isActive = active === item.route;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'border-t-2 border-primary pt-1 font-headline-lg text-body-lg uppercase tracking-[0.15em] text-primary transition-all'
                    : 'font-headline-lg text-body-lg uppercase tracking-[0.15em] text-on-surface-variant transition-all hover:text-primary'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <OrderCta
          message={buildGeneralMessage('web/header')}
          variant="outline"
          className="!px-4 !py-2 text-[10px] lg:!px-6 lg:text-label-caps"
        >
          <span className="hidden sm:inline">Order on WhatsApp</span>
          <span className="sm:hidden">Order</span>
        </OrderCta>
      </div>

      {/* Mobile nav strip — the exports are desktop-only, so this layout is ours.
          Two short links need no hamburger, and a hamburger would need JavaScript. */}
      <nav
        aria-label="Main"
        className="flex items-center gap-5 overflow-x-auto border-t border-outline-variant/30 px-margin-mobile py-2.5 sm:gap-6 lg:hidden"
      >
        {NAV.map((item) => {
          const isActive = active === item.route;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={
                isActive
                  ? 'shrink-0 font-headline-lg text-[13px] uppercase tracking-[0.12em] text-primary'
                  : 'shrink-0 font-headline-lg text-[13px] uppercase tracking-[0.12em] text-on-surface-variant'
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
