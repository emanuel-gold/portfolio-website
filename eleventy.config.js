import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import markdownItAnchor from "markdown-it-anchor";
import implicitFigures from "markdown-it-image-figures";
import {
  buildImageAttributes,
  generateImageHTML,
  escapeHtml,
  prepareImage,
} from "./tools/imageHelpers.js";

export default function (config) {

  config.addFilter("truncateChars", (str, limit) => {
    if (!str) return "";
    const plain = str.replace(/\s+/g, " ").trim();
    if (plain.length <= limit) return plain;
    let truncated = plain.slice(0, limit);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > -1) {
      truncated = truncated.slice(0, lastSpace);
    }
    return truncated + "…";
  });

  config.setLibrary(
    "md",
    markdownIt({ html: true })
    .use(markdownItAttrs)
    .use(markdownItAnchor)
    .use(implicitFigures, { 
      lazy: true,
      dataType: true,
      figcaption: "title",
      async: true
    })
  );

  config.addPassthroughCopy({ public: "." });
  config.addPassthroughCopy({ "src/assets/js": "assets" });
  config.addWatchTarget("./src/assets/css/main.css");

  const imageHotspotsMacroCall = `{% from "macros/imageHotspots.njk" import imageHotspots %}{{ imageHotspots(src, alt, hotspots, options) }}`;

  config.addNunjucksShortcode(
    "imageHotspots",
    function (src, alt, hotspots = [], options = {}) {
      const context = Object.assign({}, this.ctx ?? {}, {
        src,
        alt,
        hotspots,
        options,
      });

      return this.env.renderString(imageHotspotsMacroCall, context);
    }
  );

  config.addNunjucksAsyncShortcode(
    "postImage",
    async function (src, alt = "", options = {}) {
      const {
        imageOptions = {},
        figure = true,
        caption = null,
        figureClass,
        ...attributes
      } = options ?? {};

      const metadata = await prepareImage(this.page.inputPath, src, imageOptions);

      const imageAttributes = buildImageAttributes({ alt, ...attributes });
      const html = generateImageHTML(metadata, imageAttributes);

      if (!figure) {
        return html;
      }

      const classAttribute = figureClass ? ` class="${figureClass}"` : "";
      const captionHtml = caption
        ? `<figcaption>${escapeHtml(caption)}</figcaption>`
        : "";
      return `<figure${classAttribute}>${html}${captionHtml}</figure>`;
    }
  );

  const sortByOrderThenDate = (collection = []) => {
    return [...collection].sort((a, b) => {
      const orderA = Number.isFinite(a.data?.order) ? a.data.order : null;
      const orderB = Number.isFinite(b.data?.order) ? b.data.order : null;

      if (orderA !== null && orderB !== null && orderA !== orderB) {
        return orderA - orderB;
      }
      if (orderA !== null && orderB === null) {
        return -1;
      }
      if (orderA === null && orderB !== null) {
        return 1;
      }

      const dateA = a.date instanceof Date ? a.date.getTime() : 0;
      const dateB = b.date instanceof Date ? b.date.getTime() : 0;
      return dateB - dateA;
    });
  };

  config.addCollection("portfolio", (collectionApi) =>
    sortByOrderThenDate(
      collectionApi.getFilteredByGlob("./src/portfolio/**/post.md")
    )
  );

  config.addCollection("featuredPortfolio", (collectionApi) =>
    sortByOrderThenDate(
      collectionApi
        .getFilteredByGlob("./src/portfolio/**/post.md")
        .filter((item) => item.data?.featured)
    )
  );

  config.addFilter("sortByOrderThenDate", sortByOrderThenDate);

  config.addFilter("allTags", (collection = []) => {
    const tags = new Set();
    for (const item of collection) {
      if (Array.isArray(item.data?.tags)) {
        item.data.tags.forEach((tag) => tags.add(tag));
      }
    }
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
  };
}