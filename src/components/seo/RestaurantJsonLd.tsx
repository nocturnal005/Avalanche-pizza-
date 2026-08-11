import { SHOP } from '@/config/shop';
import { absoluteUrl } from '@/lib/site';

/**
 * Server-rendered JSON-LD — no client JavaScript, no third-party tag.
 *
 * The value of this markup is feeding Google's local knowledge panel with the
 * right name, address and phone, which is what a Bechem search actually
 * surfaces. `telephone` reads from SHOP so it can never drift from the links.
 *
 * Deliberately absent: OrderAction / potentialAction / orderUrl. Those declare
 * that the site takes orders. It does not, and telling Google otherwise invites
 * a rich result that lies to the customer.
 */
export function RestaurantJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${absoluteUrl('/')}#restaurant`,
    name: SHOP.name,
    description: SHOP.tagline,
    servesCuisine: ['Pizza', 'Italian'],
    priceRange: 'GHS 15-89',
    currenciesAccepted: 'GHS',
    url: absoluteUrl('/'),
    telephone: SHOP.whatsappE164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bechem Community Centre, along Kwasu Road',
      addressLocality: 'Bechem',
      addressRegion: 'Ahafo',
      addressCountry: 'GH',
    },
    hasMenu: absoluteUrl('/menu'),
    acceptsReservations: false,
    // openingHoursSpecification is deliberately absent: the shop's real trading
    // hours are still outstanding (Stage 4 owner intake). Publishing guessed
    // hours to Google is worse than publishing none.
  };

  return (
    <script
      type="application/ld+json"
      // Content is a literal object we control; no user input reaches it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
