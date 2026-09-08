/**
 * Corrige products.js EN PLACE, en touchant uniquement les lignes
 * `image: "..."` et `hasRealPhoto: ...` des produits qui n'ont pas
 * de photo mais dont un autre produit du même nom en a une.
 *
 * Ne change RIEN d'autre : pas de reformatage, pas de réordonnancement,
 * le reste du fichier reste identique au caractère près.
 *
 * Utilisation :
 *   node fix-photos-inplace.mjs ./products.js
 *
 * Par sécurité, écrit le résultat dans "products.js" directement
 * MAIS fait d'abord une sauvegarde "products.js.bak".
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const inputArg = process.argv[2];
if (!inputArg) {
  console.error("Usage: node fix-photos-inplace.mjs <chemin-vers-products.js>");
  process.exit(1);
}

const inputPath = path.resolve(inputArg);
let text = fs.readFileSync(inputPath, "utf-8");

// 1) Charger les données pour savoir QUI a besoin d'être corrigé et avec QUELLE image
const mod = await import(pathToFileURL(inputPath).href + `?t=${Date.now()}`);
const products = mod.products;

const byName = new Map();
for (const p of products) {
  if (!byName.has(p.name)) byName.set(p.name, []);
  byName.get(p.name).push(p);
}

const fixes = []; // { id, newImage }
for (const [, group] of byName) {
  if (group.length < 2) continue;
  const source = group.find((p) => p.hasRealPhoto && p.image);
  if (!source) continue;
  for (const p of group) {
    if (p !== source && (!p.hasRealPhoto || !p.image)) {
      fixes.push({ id: p.id, newImage: source.image });
    }
  }
}

console.log(`${fixes.length} produit(s) à corriger.`);

// 2) Pour chaque id à corriger, retrouver son bloc `{ ... }` dans le texte brut
//    en repérant `id: <N>,` puis en comptant les accolades jusqu'à la fermeture.
function findObjectBlock(text, id) {
  const idRegex = new RegExp(`id:\\s*${id}\\s*,`);
  const idMatch = idRegex.exec(text);
  if (!idMatch) return null;

  // Remonter jusqu'à l'accolade ouvrante de cet objet
  let start = idMatch.index;
  let depth = 0;
  while (start > 0) {
    if (text[start] === "}") depth++;
    if (text[start] === "{") {
      if (depth === 0) break;
      depth--;
    }
    start--;
  }

  // Avancer jusqu'à l'accolade fermante correspondante
  let end = start;
  depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  return { start, end: end + 1 };
}

let applied = 0;
// On applique les fixes en partant de la fin du fichier vers le début,
// pour ne pas décaler les positions des blocs suivants au fur et à mesure.
const sortedFixes = [...fixes].sort((a, b) => b.id - a.id);

for (const fix of sortedFixes) {
  const block = findObjectBlock(text, fix.id);
  if (!block) {
    console.warn(`⚠️  Bloc introuvable pour id ${fix.id}, ignoré.`);
    continue;
  }
  let blockText = text.slice(block.start, block.end);

  const before = blockText;
  blockText = blockText.replace(/image:\s*"[^"]*"/, `image: "${fix.newImage}"`);
  blockText = blockText.replace(/hasRealPhoto:\s*(true|false)/, "hasRealPhoto: true");

  if (blockText === before) {
    console.warn(`⚠️  Rien à changer trouvé dans le bloc id ${fix.id} (format inattendu).`);
    continue;
  }

  text = text.slice(0, block.start) + blockText + text.slice(block.end);
  applied++;
}

// 3) Sauvegarde puis écriture
const backupPath = inputPath + ".bak";
fs.copyFileSync(inputPath, backupPath);
fs.writeFileSync(inputPath, text, "utf-8");

console.log(`✅ ${applied} produit(s) corrigé(s) directement dans ${inputPath}`);
console.log(`   Sauvegarde de l'original : ${backupPath}`);
