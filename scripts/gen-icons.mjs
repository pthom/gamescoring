// Rasterize the SVG icons into the PNG sizes the manifest / iOS need.
// Run: node scripts/gen-icons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

function render(svgFile, size, outFile) {
  const svg = readFileSync(join(pub, svgFile), "utf8");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: true },
  });
  const png = resvg.render().asPng();
  writeFileSync(join(pub, outFile), png);
  console.log(`  ${outFile}  (${size}px, ${png.length} bytes)`);
}

console.log("Generating PNG icons:");
render("icon.svg", 192, "pwa-192.png");
render("icon.svg", 512, "pwa-512.png");
render("icon.svg", 180, "apple-touch-icon.png");
render("icon-maskable.svg", 512, "maskable-512.png");
console.log("Done.");
