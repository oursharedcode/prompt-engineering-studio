# Adding a kids' game page to the domain — AdSense consequences

Planning note, 8 September 2026. Concerns a proposed second-level page
`www.oursharedcode.com/mykidgame`: a words-and-pictures game for children, with
**no AdSense**, a voluntary-donation ask, and no accounts, registration, or paid
subscription.

## Short answer

Adding an ad-free kids' page will **not** get the domain rejected, and AdSense has
no rule against donation links. But because Google approves and polices the
*domain*, four things on `/mykidgame` can reach back and touch the studio's ads.
Ranked by likelihood:

## 1. Google may classify content as child-directed on its own — this is the real one

Google's policy says it "may begin to treat your site or app as child-directed"
even without notice from you, and when it does, "interest-based advertising and
remarketing ads" are disabled for that content. On the kids' page that's harmless
— it sends no ad requests. The risk is **spillover**: if kids' content becomes a
large share of the domain (by pages or, more likely, by traffic — a game can
easily out-draw a prompt tool), Google may treat the site as child-directed and
the studio's ads drop to non-personalized. Not a ban, a revenue cut.

Mitigations:

- Keep it clearly bounded and a minority of the domain. Frame it as **English
  words for kids** — that ties it to `/free-english-books/` as one education site
  rather than a random kids' property.
- A subdomain (`mykidgame.oursharedcode.com`, one CNAME file + one DNS record)
  gives a cleaner boundary than the subpath if you expect it to become the
  traffic majority. Same AdSense approval covers it either way.
- Watch the AdSense Policy Center after launch — Google says it will "attempt to
  notify you" if it applies the treatment.

## 2. Site-level enforcement for anything on the page

Publisher-policy violations anywhere on the domain can limit ads everywhere. For
a words-and-pictures game the two that matter: **image copyright** (IP abuse) and
**"adult themes in family content"**. Use your own drawings or CC0 /
public-domain sets (OpenMoji, Twemoji) and keep a licence note in the repo.

## 3. Timing and "low value content" again

You already plan to wait for approval — correct. Also don't add it *during* a
review, and don't publish "coming soon" stubs. And note the game will be a JS app
like the studio was: to a crawler it's 50 words. Give it real prose for parents
(what it teaches, how it works, what it collects) or it repeats the exact page
that got you rejected.

## 4. The donation ask

No AdSense conflict. Three cautions: address it to **parents**, not the child;
use a plain `<a href>` out to Ko-fi / PayPal / GitHub Sponsors — **no embedded
widget or iframe**, because those set cookies on a child-directed page; and
PayPal/Ko-fi require payers to be 18+, which the "for parents" framing covers.

## The adjacent thing that drives all of this: COPPA

Google's classification exists because of COPPA, and the amended rule has been
enforceable since **22 April 2026**. The "no accounts, no registration" design is
the right one — extend it to **zero third-party requests**: no visitor counter,
no Google Charts, no Google Fonts, no analytics. If the visitor counter does go
there, the amended rule now requires a specific notice for the "internal
operations" exception it relies on. Either way the domain's Privacy page needs a
children's section before launch.

## Bottom line

Proceed as planned after approval; the URL shape matters less than:

1. no ad code,
2. no third-party requests,
3. keeping it a bounded minority of the site.

## Sources

- [Tag a site or ad request for age-restricted treatment](https://support.google.com/adsense/answer/3248194?hl=en)
- [Tag an ad request for child-directed treatment (TFCD)](https://support.google.com/adsense/answer/9007197?hl=en-GB)
- [Federal Register: COPPA Rule amendments](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule)
- [Taft: Enforcement begins for COPPA amendments](https://www.privacyanddatasecurityinsight.com/2026/04/enforcement-begins-soon-for-significant-coppa-rule-amendments/)
- [White & Case: Unpacking the COPPA amendments](https://www.whitecase.com/insight-alert/unpacking-ftcs-coppa-amendments-what-you-need-know)
