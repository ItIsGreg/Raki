import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve paths
const pdfjsDistPath = path.dirname(
  path.join(__dirname, "../node_modules/pdfjs-dist/package.json")
);
const pdfWorkerPath = path.join(pdfjsDistPath, "build", "pdf.worker.mjs");
const publicPath = path.join(__dirname, "../public");

// Create public directory if it doesn't exist
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}

// Copy the worker file
fs.cpSync(pdfWorkerPath, path.join(publicPath, "pdf.worker.mjs"));

console.log("PDF.js worker file copied to public directory");
