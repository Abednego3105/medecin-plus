export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { sujet, formatId, longueur } = req.body;
  if (!sujet || !formatId || !longueur) return res.status(400).json({ error: "Parametres manquants" });

  const isComplet = longueur === "complet";
  const nbChapitres = formatId === "ebook" ? (isComplet ? 10 : 5) : (isComplet ? 8 : 4);

  const MASTER_PROMPT = `Tu es Dr. Medecin+, un medecin bienveillant et pedagogue. Tu combines rigueur medicale et langage humain, chaleureux, accessible. Reponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.`;

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
  };

  const callClaude = async (prompt) => {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 8000,
        system: MASTER_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    const text = d.content?.map(i => i.text || "").join("") || "";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  };

  try {
    if (formatId === "ebook") {
      // APPEL 1 : Structure + chapitres
      const part1 = await callClaude(`Genere la structure d'un ebook sante PREMIUM sur : "${sujet}". ${nbChapitres} chapitres.

JSON :
{
  "titre": "Titre accrocheur",
  "sous_titre": "Sous-titre rassurant",
  "accroche": "2 phrases empathiques max",
  "introduction": "${isComplet ? 200 : 100} mots chaleureux",
  "chapitres": [
    {
      "numero": 1,
      "titre": "Titre chapitre",
      "contenu": "${isComplet ? 350 : 180} mots, ton chaleureux",
      "points_cles": ["point 1", "point 2", "point 3"],
      "quiz": [
        {
          "question": "Question claire et courte ?",
          "reponses": ["A. Option A", "B. Option B", "C. Option C"],
          "bonne_reponse": "A",
          "explication": "Explication courte et bienveillante"
        },
        {
          "question": "Deuxieme question ?",
          "reponses": ["A. Option A", "B. Option B", "C. Option C"],
          "bonne_reponse": "B",
          "explication": "Explication courte"
        }
      ],
      "exercice_workbook": {
        "titre": "Titre de l'exercice",
        "consigne": "Instruction claire en 1 phrase",
        "questions": ["Question reflexion 1 ?", "Question reflexion 2 ?"]
      },
      "emplacement_image": "[IMAGE : description precise pour ChatGPT]"
    }
  ],
  "conclusion": "${isComplet ? 150 : 80} mots motivants",
  "checklist": ["action 1", "action 2", "action 3", "action 4", "action 5"]
}`);

      // APPEL 2 : Plan 30 jours + meta
      const part2 = await callClaude(`Genere pour un ebook sur "${sujet}" :

JSON :
{
  "plan_action": [
    {"semaine": 1, "objectif": "Objectif semaine 1", "actions": ["action 1", "action 2", "action 3"]},
    {"semaine": 2, "objectif": "Objectif semaine 2", "actions": ["action 1", "action 2", "action 3"]},
    {"semaine": 3, "objectif": "Objectif semaine 3", "actions": ["action 1", "action 2", "action 3"]},
    {"semaine": 4, "objectif": "Objectif semaine 4", "actions": ["action 1", "action 2", "action 3"]}
  ],
  "emplacements_images": ["[IMAGE COUVERTURE : description precise]", "[IMAGE 2 : description]", "[IMAGE 3 : description]"],
  "meta": {
    "prix_suggere_fcfa": ${isComplet ? 8000 : 5000},
    "prix_suggere_eur": ${isComplet ? 12 : 8},
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "description_vente": "Description de 120 mots pour page de vente, accrocheuse",
    "titre_seo": "Titre SEO 60 caracteres max",
    "public_cible": "Description du lecteur ideal en 1 phrase"
  }
}`);

      return res.status(200).json({ ...part1, ...part2, formatId, longueur });
    }

    // AUTRES FORMATS
    const chapitresMap = {
      guide: { court: 4, complet: 8 },
      plan_alimentaire: { court: 3, complet: 6 },
      programme_sport: { court: 4, complet: 8 },
      fiche_memo: { court: 1, complet: 2 },
      quiz: { court: 10, complet: 20 },
      atelier: { court: 4, complet: 8 },
      programme_bien_etre: { court: 5, complet: 10 },
    };
    const n = chapitresMap[formatId]?.[longueur] || 5;

    const structures = {
      guide: `${n} etapes pratiques et concretes avec materiel et duree.`,
      plan_alimentaire: `${n} sections : principes, aliments, menus ${isComplet ? "7 jours" : "3 jours"}, recettes.`,
      programme_sport: `${n} sections : echauffement, exercices, recuperation, progression ${isComplet ? "4 semaines" : "2 semaines"}.`,
      fiche_memo: `Fiche ultra-condensee : chiffres cles, signaux alerte, quand consulter.`,
      quiz: `${n} questions-reponses educatives niveau progressif.`,
      atelier: `${n} exercices workbook avec reflexions et plans d'action.`,
      programme_bien_etre: `Rituels et habitudes sur ${isComplet ? "30 jours" : "14 jours"}.`,
    };

    const data = await callClaude(`Genere un produit digital sante "${formatId}" sur "${sujet}". ${structures[formatId]}

JSON :
{
  "titre": "Titre accrocheur",
  "sous_titre": "Sous-titre rassurant",
  "accroche": "2 phrases empathiques",
  "introduction": "${isComplet ? 200 : 100} mots",
  "sections": [{"numero": 1, "titre": "...", "contenu": "${isComplet ? 300 : 150} mots", "points_cles": ["..."], "emplacement_image": "[IMAGE : description]"}],
  "conclusion": "Conclusion motivante",
  "checklist": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "emplacements_images": ["[IMAGE COUVERTURE : description]"],
  "meta": {
    "prix_suggere_fcfa": 3000,
    "prix_suggere_eur": 5,
    "tags": ["tag1", "tag2", "tag3"],
    "description_vente": "120 mots",
    "titre_seo": "60 chars max",
    "public_cible": "description"
  }
}`);

    return res.status(200).json({ ...data, formatId, longueur });
  } catch (err) {
    return res.status(500).json({ error: "Erreur : " + err.message });
  }
}
