import type { StaticImageData } from 'next/image';

import theAvalanche from '@/assets/images/menu-the-avalanche.jpg';
import margherita from '@/assets/images/menu-margherita.jpg';
import pepperoni from '@/assets/images/menu-pepperoni.jpg';
import chickenFeast from '@/assets/images/menu-chicken-feast.jpg';
import earthsBounty from '@/assets/images/menu-earths-bounty.jpg';
import thePacific from '@/assets/images/menu-the-pacific.jpg';
import bbqOriginal from '@/assets/images/menu-bbq-original.jpg';
import spicyBeefOne from '@/assets/images/menu-spicy-beef-one.jpg';
import freeChoice from '@/assets/images/menu-free-choice.jpg';
import all4One from '@/assets/images/menu-all-4-one.jpg';
import classic from '@/assets/images/menu-classic.jpg';

import dealPartyFeast from '@/assets/images/deal-party-feast.png';
import dealTheSummit from '@/assets/images/deal-the-summit.jpg';
import dealBasecamp from '@/assets/images/deal-basecamp.jpg';
import dealTheAscent from '@/assets/images/deal-the-ascent.jpg';
import dealTheGathering from '@/assets/images/deal-the-gathering.jpg';

import homeHero from '@/assets/images/avalanche-signature-hero.jpg';
import homeMargherita from '@/assets/images/home-feature-margherita.jpg';
import homePepperoni from '@/assets/images/home-feature-pepperoni.jpg';
import chefDough from '@/assets/images/chef-stretching-dough.jpg';
import ovenFlame from '@/assets/images/oven-blue-flame.jpg';
import ingredients from '@/assets/images/ingredients-flat-lay.jpg';

import aboutHero from '@/assets/images/about-hero.jpg';
import aboutStory from '@/assets/images/about-story.jpg';
import aboutAma from '@/assets/images/about-team-ama.jpg';
import aboutEfia from '@/assets/images/about-team-efia.jpg';

/**
 * Statically imported so every image carries intrinsic dimensions (CLS ≈ 0),
 * an auto-generated blur placeholder, and a content-hashed filename for
 * immutable caching. A renamed file becomes a build error, not a 404.
 *
 * Content files reference these by key, staying pure data.
 */
export const IMAGES = {
  'menu-the-avalanche': theAvalanche,
  'menu-margherita': margherita,
  'menu-pepperoni': pepperoni,
  'menu-chicken-feast': chickenFeast,
  'menu-earths-bounty': earthsBounty,
  'menu-the-pacific': thePacific,
  'menu-bbq-original': bbqOriginal,
  'menu-spicy-beef-one': spicyBeefOne,
  'menu-free-choice': freeChoice,
  'menu-all-4-one': all4One,
  'menu-classic': classic,

  'deal-party-feast': dealPartyFeast,
  'deal-the-summit': dealTheSummit,
  'deal-basecamp': dealBasecamp,
  'deal-the-ascent': dealTheAscent,
  'deal-the-gathering': dealTheGathering,

  'home-hero': homeHero,
  'home-feature-margherita': homeMargherita,
  'home-feature-pepperoni': homePepperoni,
  'story-chef-dough': chefDough,
  'story-oven-flame': ovenFlame,
  'story-ingredients': ingredients,

  'about-hero': aboutHero,
  'about-story': aboutStory,
  'about-team-ama': aboutAma,
  'about-team-efia': aboutEfia,
} as const satisfies Record<string, StaticImageData>;

export type ImageKey = keyof typeof IMAGES;

export const IMAGE_KEYS = Object.keys(IMAGES) as [ImageKey, ...ImageKey[]];

export function image(key: ImageKey): StaticImageData {
  return IMAGES[key];
}
