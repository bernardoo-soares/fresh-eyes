# Notice

This skill is MIT licensed (`LICENSE`). Its knowledge is distilled from published design writing. Every card
in `references/` names its source on its **Why** line. The lists in `floor.md` (drawn from WCAG 2.2), `modern.md`,
`tells.md` and `stacks/`, and the starting values in `craft.md`, are this skill's own. All of it is written in this skill's own words: no source text is reproduced, and no claim is made that any author
endorses it.

## Sources

- Steve Krug, *Don't Make Me Think, Revisited* (3rd ed.).
- Herbert A. Simon, "Rational Choice and the Structure of the Environment" (*Psychological Review*, 1956; collected
  in *Models of Man*, 1957), which introduces "satisficing".
- Jakob Nielsen, *10 Usability Heuristics for User Interface Design* (Nielsen Norman Group).
- Nielsen Norman Group articles: Nielsen, "Response Times: The 3 Important Limits" (1993) and "URL as UI" (1999);
  Hoa Loranger, "State the Price to Give B2B Sites a Competitive Advantage" (2013) and "Infinite Scrolling Is Not
  for Every Website" (2014); Kara Pernice and Raluca Budiu, "Hamburger Menus and Hidden Navigation Hurt UX Metrics"
  (2016); Therese Fessenden, "Modal & Nonmodal Dialogs" (2017) and "Scrolling and Attention" (2018); Rachel Krause,
  "10 Design Guidelines for Reporting Errors in Forms" (2019); Sara Paul, "Scrolljacking 101" (2023).
- Don Norman, *The Design of Everyday Things* (revised ed.).
- Jon Yablonski, *Laws of UX* (lawsofux.com and the book), read sceptically: each law is used only where it changes
  a concrete decision, with its evidence noted.
- Louis Rosenfeld, Peter Morville and Jorge Arango, *Information Architecture: For the Web and Beyond* (4th ed.).
- Alan Cooper, Robert Reimann, David Cronin and Christopher Noessel, *About Face: The Essentials of Interaction
  Design* (4th ed.).
- Jenifer Tidwell, Charles Brewer and Aynne Valencia, *Designing Interfaces* (3rd ed.).
- Adam Wathan and Steve Schoger, *Refactoring UI*.
- Edward Tufte, *The Visual Display of Quantitative Information*, *Envisioning Information* and *Beautiful Evidence*.
- Stephen Few, *Information Dashboard Design* (2nd ed.).
- Kinneret Yifrah, *Microcopy: The Complete Guide*.
- Nicole Fenton and Kate Kiefer Lee, *Nicely Said*.
- Ginny Redish, *Letting Go of the Words* (2nd ed.).
- GOV.UK, the A to Z style guide (guidance.publishing.service.gov.uk) and the GOV.UK Design System.
- Luke Wroblewski, *Web Form Design: Filling in the Blanks* (Rosenfeld Media, 2008), "Inline Validation in Web
  Forms" (A List Apart, 2009) and *Mobile First* (A Book Apart, 2011); Ethan Marcotte, *Responsive Web Design*
  (A Book Apart, 2011).
- Steven Hoober, "How Do Users Really Hold Mobile Devices?" (UXmatters, 2013).
- Apple, *Human Interface Guidelines*, as one source among these, translated to the web; Google, Material Design 2
  (dark theme).
- Matthew Butterick, *Practical Typography*; Robert Bringhurst, *The Elements of Typographic Style*.
- W3C: *Web Content Accessibility Guidelines (WCAG) 2.2*; the WAI-ARIA Authoring Practices Guide; Internationalization,
  "Text size in translation"; CSS Flexible Box Layout and CSS Text Level 4; Tim Berners-Lee, "Cool URIs don't
  change" (1998).
- Unicode CLDR plural rules; ECMA-402, the ECMAScript Internationalization API.
- web.dev, Core Web Vitals; MDN, View Transition API.
- US Federal Trade Commission, Trade Regulation Rule on the Use of Consumer Reviews and Testimonials (16 CFR Part
  465, 2024).

## Code

The perceptual colour functions in `scripts/lib/color.mjs` implement published definitions: OKLab (Björn
Ottosson, 2020) and the colour-vision deficiency simulation of Machado, Oliveira and Fernandes (2009).
`scripts/render.mjs` runs axe-core (Deque Systems, MPL-2.0) and Playwright (Microsoft, Apache-2.0), installed as
dependencies, not bundled. `tests/fixtures/snapshot/inter-bold-subset.woff2` is a subset of Inter (Rasmus
Andersson), under the SIL Open Font License 1.1; the licence text is in `tests/fixtures/snapshot/OFL.txt`.

## History

Version 1 of this skill (`designing-saas-interfaces`) also absorbed guidelines from other open design skills
(emil-design-eng, impeccable, Vercel's Web Interface Guidelines, UI UX Pro Max, frontend-design, taste-skill), with
their licences recorded in that version's `NOTICE.md`. Version 2 was rewritten from the sources above and keeps
none of that text.
