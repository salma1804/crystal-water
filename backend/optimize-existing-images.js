// backend/optimize-existing-images.js
//
// Script à lancer UNE SEULE FOIS pour compresser toutes les photos existantes.
// Ne touche JAMAIS au dossier original — écrit uniquement dans un nouveau dossier séparé.
//
// Utilisation (depuis le dossier backend/) :
//   node optimize-existing-images.js
//
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SOURCE_DIR = path.join(process.cwd(), '..', 'frontend', 'public', 'product-images');
const OUTPUT_DIR = path.join(process.cwd(), '..', 'frontend', 'public', 'product-images-optimized');

const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

async function run() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Dossier introuvable : ${SOURCE_DIR}`);
    console.error('   Vérifie que ce script est bien lancé depuis le dossier backend/.');
    return;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = fs.readdirSync(SOURCE_DIR).filter((f) =>
    VALID_EXTENSIONS.includes(path.extname(f).toLowerCase())
  );

  console.log(`📸 ${files.length} images trouvées dans ${SOURCE_DIR}`);
  console.log(`➡️  Compression vers ${OUTPUT_DIR} (l'original n'est jamais modifié)\n`);

  let done = 0;
  let totalBefore = 0;
  let totalAfter = 0;
  let errors = 0;

  for (const file of files) {
    const inputPath = path.join(SOURCE_DIR, file);
    const outputName = file.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp');
    const outputPath = path.join(OUTPUT_DIR, outputName);

    try {
      const beforeSize = fs.statSync(inputPath).size;

      await sharp(inputPath)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outputPath);

      const afterSize = fs.statSync(outputPath).size;

      totalBefore += beforeSize;
      totalAfter += afterSize;
      done++;

      if (done % 50 === 0) {
        console.log(`... ${done}/${files.length} traitées`);
      }
    } catch (err) {
      errors++;
      console.error(`⚠️  Erreur sur "${file}" : ${err.message} (fichier ignoré, original intact)`);
    }
  }

  const mbBefore = (totalBefore / 1024 / 1024).toFixed(1);
  const mbAfter = (totalAfter / 1024 / 1024).toFixed(1);
  const reduction = totalBefore > 0 ? Math.round((1 - totalAfter / totalBefore) * 100) : 0;

  console.log('\n✅ Terminé !');
  console.log(`   ${done} images compressées, ${errors} erreur(s)`);
  console.log(`   Taille avant : ${mbBefore} Mo`);
  console.log(`   Taille après : ${mbAfter} Mo`);
  console.log(`   Réduction : ${reduction}%`);
  console.log(`\n👉 Va comparer quelques images dans les deux dossiers avant de basculer le site dessus.`);
}

run();