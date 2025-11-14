import { getPrimaryImageUrl, prepareImage } from "../../tools/imageHelpers.js";

async function resolveImageUrl(data, key) {
  const value = data[key];
  if (!value || typeof value !== "string") {
    return value;
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }

  const metadata = await prepareImage(data.page.inputPath, value);
  return getPrimaryImageUrl(metadata) ?? value;
}

export default {
  eleventyComputed: {
    permalink: (data) => {
      const stem = data.page?.filePathStem;
      if (typeof stem === "string" && stem.endsWith("/post")) {
        return `${stem.replace(/\/post$/, "")}/`;
      }
      return data.permalink;
    },
    thumbnail: async (data) => resolveImageUrl(data, "thumbnail"),
    header_image: async (data) => resolveImageUrl(data, "header_image"),
  },
};
