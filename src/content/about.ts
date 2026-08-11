import type { ImageKey } from './images';

/**
 * About Us content, transcribed verbatim from the Stitch export Frank supplied
 * as `stitch_gourmet_pizza_ordering_platform.zip` (archived at
 * design/stitch-exports/about-us-v2.html, screenshot in previews/).
 *
 * Three numbered chapters — 01 Our Story, 02 The Team, 03 Brand Philosophy.
 * The numbering is the design's own and carries real sequence, so it is
 * content here rather than decoration.
 */

export const about = {
  hero: {
    title: 'About Us',
    tagline: 'Crafted in Bechem. Made for good times.',
    image: 'about-hero' as ImageKey,
    imageAlt:
      'The Avalanche Pizza dining room, warmly lit and busy with people sharing tables',
  },

  story: {
    index: '01',
    heading: ['Our', 'Story'],
    image: 'about-story' as ImageKey,
    imageAlt: 'A finished Avalanche signature pizza, shot close up to show the fresh toppings',
    /** The first paragraph carries the drop cap. */
    paragraphs: [
      'BORN IN BECHEM. MADE FOR GOOD TIMES. Avalanche Pizza is a contemporary pizza brand based in Bechem, Ahafo Region, Ghana, created for people who believe great pizza should be about more than simply satisfying hunger.',
      'We bring together carefully prepared dough, quality ingredients, generous toppings and high-temperature baking to create pizzas with bold flavour, satisfying texture and plenty of character. Every pizza is made with attention to the details that matter, from the balance of the toppings to the final bake.',
      'Avalanche is built for a new generation of pizza lovers. Young, social and unapologetically particular about what they eat.',
      'Our style is modern, our flavours are confident, and our approach is uncomplicated. We want customers to enjoy familiar favourites alongside combinations with a little more personality, all served through an experience that feels fresh, social and distinctly Avalanche.',
    ],
    missionLabel: 'Our Mission',
    mission:
      'To create consistently satisfying pizzas for a new generation of food lovers, bringing together quality, flavour and a social dining experience that feels distinctly Avalanche.',
  },

  team: {
    index: '02',
    headingLead: 'The Team Behind',
    headingAccent: 'The Taste',
    intro:
      'Our kitchen is powered by passionate, dedicated individuals who treat every pizza as their masterpiece.',
    members: [
      {
        name: 'Ama',
        role: 'Head Chef',
        image: 'about-team-ama' as ImageKey,
        imageAlt: 'Ama, head chef, holding a freshly baked pizza in the Avalanche kitchen',
      },
      {
        name: 'Efia',
        role: 'Operations Lead',
        image: 'about-team-efia' as ImageKey,
        imageAlt: 'Efia, operations lead, carrying a pizza past the oven',
      },
    ],
  },

  philosophy: {
    index: '03 // Brand Philosophy',
    /** Rendered as: Our style is *contemporary*, our flavours are **distinct**. */
    headingLead: 'Our style is',
    headingItalic: 'contemporary',
    headingMid: 'our flavours are',
    headingAccent: 'distinct',
    body: 'Founded with a passion for bringing authentic, expertly crafted pizza to our community. Avalanche pizza is an epitome of modern taste. We believe that great pizza is a craft, a perfect balance of heat, timing, and the finest ingredients that we can source. We keep our approach fresh and contemporary while letting quality ingredients and well-balanced flavours do the talking.',
    ctaLabel: 'Explore The Menu',
  },
} as const;
