export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { sujet, formatId, longueur } = req.body;
  if (!sujet || !formatId || !longueur) return res.status(400).json({ error: "Parametres manquants" });

  const isComplet = longueur === "complet";
  const chapitresMap = {
    ebook: { court: 5, complet: 10 },
    guide: { court: 4, complet: 8 },
    plan_alimentaire: { court: 3, complet: 7 },
    programme_sport: { court: 4, complet: 8 },
    fiche_memo: { court: 1, complet: 2 },
    quiz: { court: 10, complet: 20 },
    atelier: { court: 4, complet: 8 },
    programme_bien_etre: { court: 5, complet: 10 },
  };
  const n = chapitresMap[formatId]?.[longueur] || 5;

  const MASTER_PROMPT = `Tu es Dr. Medecin+, un medecin bienveillant qui s'adresse a ses patients avec chaleur et simplicite. Tu combines la rigueur medicale avec un langage humain, naturel et accessible. Reponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.`;

  const structures = {
    ebook: `${n} chapitres sur : definition, causes, symptomes, diagnostic, traitements${isComplet ? ", alimentation, mode de vie, cas particuliers, soutien psychologique, vivre avec la maladie" : ", prevention"}.`,
    guide: `${n} etapes pratiques et concretes.`,
    plan_alimentaire: `${n} sections : principes nutritionnels, aliments a privilegier/eviter, menus types${isComplet ? " 7 jours" : " 3 jours"}, recettes simples.`,
    programme_sport: `${n} sections : echauffement, exercices, recuperation, progression ${isComplet ? "4 semaines" : "2 semaines"}.`,
    fiche_memo: `${n} section(s) ultra-condensee(s) : chiffres cles, signaux d'alerte, quand consulter.`,
    quiz: `${n} questions-reponses educatives.`,
    atelier: `${n} exercices de reflexion et d'action.`,
    programme_bien_etre: `${n} sections : rituels, habitudes saines, suivi ${isComplet ? "30 jours" : "14 jours"}.`,
  };

  const userPrompt = `Genere un produit digital sante de type "${formatId}" sur : "${sujet}". Longueur : ${longueur}. Structure : ${structures[formatId]}

JSON attendu :
{
  "titre": "Titre accrocheur",
  "sous_titre": "Sous-titre rassurant",
  "accroche": "1-2 phrases empathiques (50 mots max)",
  "introduction": "Introduction chaleureuse (${isComplet ? 250 : 120} mots)",
  "sections": [{"numero": 1, "titre": "...", "contenu": "...", "points_cles": ["..."], "emplacement_image": "[IMAGE : description]"}],
  "conclusion": "Conclusion motivante",
  "checklist": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "emplacements_images": ["[IMAGE COUVERTURE : description]"],
  "meta": {"prix_suggere_fcfa": 3000, "prix_suggere_eur": 5, "tags": ["tag1"], "description_vente": "150 mots", "titre_seo": "60 chars max", "public_cible": "description"}
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: MASTER_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.content?.map(i => i.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Erreur : " + err.message });
  }
}
