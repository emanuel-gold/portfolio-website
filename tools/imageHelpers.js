import path from "node:path";
import { promises as fs } from "node:fs";

const OUTPUT_DIR = path.resolve("./_site/img");
const OUTPUT_URL = "/img/";
const copiedImages = new Set();

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function sanitizeFileName(fileName, prefix) {
  const extension = path.extname(fileName);
  const baseName = fileName.slice(0, fileName.length - extension.length);
  const sanitizedBase = slugify(baseName) || "image";
  const slugPrefix = slugify(prefix ?? "");
  const sanitizedPrefix = slugPrefix ? `${slugPrefix}-` : "";
  return `${sanitizedPrefix}${sanitizedBase}${extension.toLowerCase()}`;
}

async function copyImage(sourcePath, destinationPath) {
  if (copiedImages.has(destinationPath)) {
    return;
  }

  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.copyFile(sourcePath, destinationPath);
  copiedImages.add(destinationPath);
}

export async function prepareImage(baseFilePath, src, options = {}) {
  if (!src) {
    return null;
  }

  if (typeof src !== "string") {
    throw new TypeError(`Expected image source to be a string, received ${typeof src}`);
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return {
      url: src,
      sourcePath: src,
      outputPath: null,
      fileName: null,
    };
  }

  if (src.startsWith("/")) {
    return {
      url: src,
      sourcePath: src,
      outputPath: null,
      fileName: null,
    };
  }

  const sourcePath = path.resolve(path.dirname(baseFilePath), src);
  const postSlug = options.slug ?? path.basename(path.dirname(baseFilePath));
  const targetFileName = sanitizeFileName(path.basename(src), postSlug);
  const outputPath = path.join(OUTPUT_DIR, targetFileName);

  await copyImage(sourcePath, outputPath);

  return {
    url: `${OUTPUT_URL}${targetFileName}`,
    sourcePath,
    outputPath,
    fileName: targetFileName,
  };
}

export function buildImageAttributes(attributes = {}) {
  const {
    alt = "",
    loading = "lazy",
    decoding = "async",
    sizes,
    class: className,
    ...rest
  } = attributes;

  return {
    alt,
    loading,
    decoding,
    sizes,
    ...(className ? { class: className } : {}),
    ...rest,
  };
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generateImageHTML(imageInfo, attributes = {}) {
  if (!imageInfo) {
    return "";
  }

  const attrs = { ...attributes, src: imageInfo.url };
  const htmlAttributes = Object.entries(attrs)
    .filter(([, value]) => value !== null && value !== undefined && value !== false)
    .map(([key, value]) => {
      if (value === true) {
        return key;
      }
      return `${key}="${escapeAttribute(value)}"`;
    })
    .join(" ");

  return `<img ${htmlAttributes}>`;
}

export function getPrimaryImageUrl(imageInfo) {
  if (!imageInfo) {
    return null;
  }
  return imageInfo.url;
}
