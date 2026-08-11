# Stitch source images

Full-resolution masters for imagery the owner supplied as individual Stitch
screens rather than as part of a page export. Archived so a future replacement
can be re-derived without hunting for the original screen.

**Always request `=w2048`.** The bare `lh3.googleusercontent.com` URL returns a
**512 px** thumbnail, and that default is exactly what made the site's imagery
look blurry before (fixed in `08d6d76`). The suffix caps at the true native
size, so asking for more than exists is harmless — asking for less is not.
Verify the pixels you actually received before treating a file as final.

| File | Native | Source | Used as |
|---|---|---|---|
| `home-feature-vegetarian-1024.jpg` | 1024×1024 | `projects/14597907360360833516/screens/09cabc53600a4705982b85c9ed012d99` | `src/assets/images/home-feature-margherita.jpg` — homepage featured card 1 |
| `home-feature-pepperoni-1024.jpg` | 1024×1024 | `projects/14597907360360833516/screens/20ed10d0b110480fa860aa4c521dc0ed` | `src/assets/images/home-feature-pepperoni.jpg` — homepage featured card 2 |
| `about-team-ama-1024.png` | 1024×1024 | `stitch_gourmet_pizza_ordering_platform (2).zip` | `src/assets/images/about-team-ama.jpg` — About §02, Ama / Head Chef |
| `about-team-efia-1024.png` | 1024×1024 | `stitch_gourmet_pizza_ordering_platform (1).zip` | `src/assets/images/about-team-efia.jpg` — About §02, Efia / Operations Lead |

**Which team portrait is whose is evidence, not inference.** The zip filenames
are `(1)` and `(2)` and carry nothing else useful — but the apron in `(1)`
reads **"AVALANCHE / OPERATIONS LEAD"**, which is Efia's role, and `(2)` shows
a chef holding a finished pizza on a peel, which is Ama's. Positional guessing
on a pair of same-sized files is how images got swapped here once before; read
the picture before mapping it.

The team masters are kept as PNG because that is how the owner supplied them;
they ship as JPEG at `-q:v 2` (~190 KB each). Re-derive from the PNG rather
than re-compressing the JPEG if they ever need changing.

The two homepage images were probed at `=w1024`, `=w2048`, `=w4096` and `=s0`; all four return the
same 1024×1024 file, so **1024 px is the true ceiling** for these two, not a
setting we can raise. They replace 1408×768 masters, so the *horizontal* pixel
count went down even though the images are larger overall — see the commit
message for what that means at the rendered card size.

**Check every replacement against its crop before assuming the composition
holds.** `object-cover` throws away whatever does not fit:

- Homepage feature cards — roughly 560×400 CSS px, so a square master keeps
  about the middle 71% of its *height*.
- About team cards — `aspect-square` on mobile, `md:aspect-[4/5]` on desktop,
  so a square master keeps the middle 819 px of its *width* (80%).

Both team portraits were checked against the 4:5 crop and keep their subject's
face well inside the frame.
