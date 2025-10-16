export default function (config) {
  config.addPassthroughCopy({ public: "." });
  config.addPassthroughCopy({ "src/assets/js": "assets" });
  config.addWatchTarget("./src/assets/css/main.css");

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
      collectionApi.getFilteredByGlob("./src/portfolio/**/*.md")
    )
  );

  config.addCollection("featuredPortfolio", (collectionApi) =>
    sortByOrderThenDate(
      collectionApi
        .getFilteredByGlob("./src/portfolio/**/*.md")
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
