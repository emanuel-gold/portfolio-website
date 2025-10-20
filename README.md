# My Portfolio Site

This repository contains the Eleventy-powered portfolio site.

## Local development

- `npm install`
- `npm run dev` — runs Eleventy with Tailwind in watch mode.
- `npm run site-editor` — starts a local-only UI at <http://localhost:3333> for editing `src/_data/site.js`. The editor reads and writes the source file directly so Eleventy picks up changes on rebuild.

The dev command runs Eleventy and the Tailwind CSS watcher in parallel.

## Using the image hotspot module

The hotspot macro allows you to add interactive hotspots with popovers to any image when a page uses the `layouts/base.njk` layout (including blog posts that extend `layouts/post.njk`).

1. Use the `imageHotspots` Nunjucks shortcode with the image source, alt text, and a list of hotspot objects. Each hotspot accepts:
   - `x` and `y`: The hotspot position as percentages (0–100) from the top-left corner.
   - `content`: The HTML rendered inside the popover.
   - Optional `label`: Text shown next to the trigger.
   - Optional `icon`: Custom markup for the trigger icon.
   - Optional `placement`: `top`, `right`, `bottom`, or `left` to control where the popover appears.
   - Optional `offsetX` / `offsetY`: CSS length values to nudge the popover.

   ```njk
   {% imageHotspots
     "/img/example.jpg",
     "Detailed photo with hotspots",
     [
       {
         x: 28,
         y: 62,
         label: "Callout",
         placement: "right",
         content: '<p>Explain the detail here.</p>'
       },
       {
         x: 70,
         y: 18,
         content: '<p>Another point of interest.</p>',
         offsetX: "0.75rem"
       }
     ],
     {
       caption: "Figure 1. Highlights across the hero image.",
       width: 1200,
       height: 800,
       wrapperClass: "mt-8"
     }
   %}
   ```

2. Optional options control the surrounding figure:
   - `caption`: Adds a `<figcaption>` under the image.
   - `width` and `height`: Output intrinsic dimensions on the `<img>`.
   - `figureClass`, `imageClass`, and `wrapperClass`: Append classes for additional styling.
   - `loading`: Override the default `lazy` loading mode.

Hotspots share global client-side behavior that is automatically included through `assets/main.js`, so no extra scripts are necessary.

## Featured projects

- Add `featured: true` to a project's front matter to surface it on the home page by default.
- Featured items are sorted by their numeric `order` value (ascending); items without an explicit order fall back to their publish date (newest first).
- Only the top three featured projects render when the page initially loads. The remaining items stay hidden until you pick a matching tag or run a search, and the original trio returns when you reset the filter to **All**.
