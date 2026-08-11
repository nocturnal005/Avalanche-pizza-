# Stitch source images

Full-resolution masters for imagery the owner supplied as individual Stitch
screens rather than as part of a page export. Archived so a future replacement
can be re-derived without hunting for the original screen.

**Always request `=w2048`.** The bare `lh3.googleusercontent.com` URL returns a
**512 px** thumbnail, and that default is exactly what made the site's imagery
look blurry before (fixed in `08d6d76`). The suffix caps at the true native
size, so asking for more than exists is harmless — asking for less is not.
Verify the pixels you actually received before treating a file as final.

| File | Native | Stitch screen | Used as |
|---|---|---|---|
| `home-feature-vegetarian-1024.jpg` | 1024×1024 | `projects/14597907360360833516/screens/09cabc53600a4705982b85c9ed012d99` | `src/assets/images/home-feature-margherita.jpg` — homepage featured card 1 |
| `home-feature-pepperoni-1024.jpg` | 1024×1024 | `projects/14597907360360833516/screens/20ed10d0b110480fa860aa4c521dc0ed` | `src/assets/images/home-feature-pepperoni.jpg` — homepage featured card 2 |

Both were probed at `=w1024`, `=w2048`, `=w4096` and `=s0`; all four return the
same 1024×1024 file, so **1024 px is the true ceiling** for these two, not a
setting we can raise. They replace 1408×768 masters, so the *horizontal* pixel
count went down even though the images are larger overall — see the commit
message for what that means at the rendered card size.

The card container is roughly 560×400 CSS px and uses `object-cover`, so a
square master is centre-cropped to about the middle 71% of its height. Both
images survive that crop with their subject intact; check any replacement
against it before assuming the composition holds.
