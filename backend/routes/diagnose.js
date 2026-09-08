import express from 'express';

const router = express.Router();

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

// POST /api/diagnose — reçoit le problème du client + un catalogue compact,
// demande à Gemini de recommander 1 à 5 produits PARMI CEUX FOURNIS (jamais inventés).
router.post('/', async (req, res) => {
  try {
    const { problem, catalog } = req.body;

    if (!problem || typeof problem !== 'string' || problem.trim().length < 5) {
      return res.status(400).json({ error: 'Merci de décrire votre problème (au moins quelques mots).' });
    }
    if (!Array.isArray(catalog) || catalog.length === 0) {
      return res.status(400).json({ error: 'Catalogue manquant.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('VOTRE-CLE')) {
      console.warn('⚠️  GEMINI_API_KEY pas encore configurée dans backend/.env');
      return res.status(500).json({ error: 'Configuration serveur incomplète.' });
    }

    const catalogText = catalog.map((p) => `${p.id}|${p.name}|${p.cat}`).join('\n');

    const prompt = `Tu es un technicien expert en traitement et filtration d'eau pour Crystal Water, une entreprise tunisienne. Un client décrit son problème d'eau. Tu dois recommander entre 1 et 5 produits PARMI CEUX DE LA LISTE CI-DESSOUS UNIQUEMENT (ne jamais inventer un produit ou un id qui n'est pas dans la liste).

CATALOGUE (format id|nom|catégorie) :
${catalogText}

PROBLÈME DU CLIENT :
"""${problem.trim()}"""

Réponds UNIQUEMENT avec un objet JSON valide de cette forme exacte, sans texte avant ni après :
{
  "summary": "une ou deux phrases expliquant le diagnostic au client, en français, ton chaleureux et professionnel",
  "recommendations": [
    { "id": <id exact du catalogue>, "reason": "courte explication (1 phrase) de pourquoi ce produit convient à ce client" }
  ]
}`;

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Erreur Gemini:', geminiRes.status, errText);
      return res.status(502).json({ error: "Le diagnostic n'a pas pu être généré, réessayez." });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error('Réponse Gemini vide/inattendue:', JSON.stringify(geminiData));
      return res.status(502).json({ error: "Le diagnostic n'a pas pu être généré, réessayez." });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      console.error('JSON invalide renvoyé par Gemini:', rawText);
      return res.status(502).json({ error: "Le diagnostic n'a pas pu être généré, réessayez." });
    }

    // Sécurité : on ne garde que les recommandations dont l'id existe VRAIMENT dans le catalogue envoyé
    const validIds = new Set(catalog.map((p) => p.id));
    const safeRecommendations = (parsed.recommendations || [])
      .filter((r) => validIds.has(r.id))
      .slice(0, 5);

    res.json({
      summary: parsed.summary || '',
      recommendations: safeRecommendations,
    });
  } catch (err) {
    console.error('Erreur /api/diagnose:', err);
    res.status(500).json({ error: 'Une erreur est survenue, réessayez plus tard.' });
  }
});

export default router;