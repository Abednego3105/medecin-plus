import { useState, useEffect } from "react";
import Head from "next/head";

const PALETTE = {
  bg: "#060d1a", surface: "#0d1b2e", card: "#111f35", border: "#1e3050",
  teal: "#0ea5a0", tealDim: "rgba(14,165,160,0.12)", gold: "#f5c842",
  text: "#e2eaf5", muted: "#6b8aaa", subtle: "#2a3f5a",
};

const FORMATS = [
  { id: "ebook", icon: "📖", label: "Ebook Premium", desc: "Quiz + Workbook + Plan 30j" },
  { id: "guide", icon: "🗺️", label: "Guide Pratique", desc: "Étapes concrètes & conseils" },
  { id: "plan_alimentaire", icon: "🥗", label: "Plan Alimentaire", desc: "Menu & nutrition santé" },
  { id: "programme_sport", icon: "💪", label: "Programme Sport", desc: "Exercices & routines" },
  { id: "fiche_memo", icon: "📋", label: "Fiche Mémo", desc: "L'essentiel en 1 page" },
  { id: "quiz", icon: "🧠", label: "Quiz Santé", desc: "Questions & réponses éducatives" },
  { id: "atelier", icon: "🎓", label: "Atelier / Workbook", desc: "Exercices interactifs" },
  { id: "programme_bien_etre", icon: "🌿", label: "Programme Bien-être", desc: "Routines & habitudes" },
];

const LONGUEURS = [
  { id: "court", label: "Court", pages: "20–35 pages", prix: "5 000–8 000 FCFA" },
  { id: "complet", label: "Complet", pages: "50–80+ pages", prix: "8 000–15 000 FCFA" },
];

const EXEMPLES = [
  "Le diabète de type 2", "L'hypertension artérielle", "Le paludisme", "La dépression",
  "L'obésité", "Les AVC", "Le cancer du sein", "L'insomnie",
  "L'anxiété chronique", "Les maladies cardiaques", "La ménopause", "La malnutrition",
];

const PLATEFORMES = [
  { id: "chariow", label: "Chariow", color: "#FF6B35" },
  { id: "gumroad", label: "Gumroad", color: "#FF90E8" },
  { id: "selar", label: "Selar", color: "#6C5CE7" },
  { id: "payhip", label: "Payhip", color: "#2ECC71" },
];

function generateWordHTML(data, formatId) {
  const format = FORMATS.find(f => f.id === formatId);
  const isEbook = formatId === "ebook";

  // Word-compatible box using table
  const box = (bgColor, borderColor, titleHtml, contentHtml) => `
<table width="100%" cellpadding="10" cellspacing="0" style="margin:12pt 0;border-collapse:collapse;">
  <tr><td style="background:${bgColor};border-left:4px solid ${borderColor};padding:10pt 14pt;">
    ${titleHtml ? `<p style="font-weight:bold;color:${borderColor};margin:0 0 8pt;">${titleHtml}</p>` : ""}
    ${contentHtml}
  </td></tr>
</table>`;

  const pageBreak = `<br clear="all" style="page-break-before:always;" />`;

  let bodyHTML = "";

  if (isEbook && data.chapitres) {
    data.chapitres.forEach((ch, i) => {
      bodyHTML += `
${i > 0 ? pageBreak : ""}
<h2 style="font-size:15pt;color:#0ea5a0;border-bottom:2px solid #0ea5a0;padding-bottom:4pt;">Chapitre ${ch.numero} — ${ch.titre}</h2>
<p>${(ch.contenu || "").replace(/\n/g, "</p><p>")}</p>

${ch.points_cles?.length ? box("#f0fdfa","#0ea5a0","Points clés",ch.points_cles.map(p=>`<p style="margin:3pt 0;">&#10003; &nbsp;${p}</p>`).join("")) : ""}

${ch.emplacement_image ? box("#f0fdfa","#0ea5a0","","<p style='text-align:center;color:#0ea5a0;'>&#128444; " + ch.emplacement_image + "</p>") : ""}

${ch.quiz?.length ? box("#fffbeb","#f5c842",`&#129504; Quiz — Chapitre ${ch.numero}`,
  ch.quiz.map((q,qi)=>`
<p style="font-weight:bold;margin:8pt 0 4pt;">${qi+1}. ${q.question}</p>
${q.reponses.map(r=>`<p style="margin:2pt 0 2pt 12pt;">&#9633; &nbsp;${r}</p>`).join("")}
<p style="font-size:10pt;color:#666;font-style:italic;margin:4pt 0 8pt 12pt;">&#10003; Bonne réponse : ${q.bonne_reponse} — ${q.explication}</p>
`).join("<hr style='border:none;border-top:1px solid #eee;margin:6pt 0;'/>")
) : ""}

${ch.exercice_workbook ? box("#f0f4ff","#6366f1",`&#9997;&#65039; Workbook — ${ch.exercice_workbook.titre||"Exercice pratique"}`,
  `<p style="margin:0 0 8pt;">${ch.exercice_workbook.consigne}</p>` +
  (ch.exercice_workbook.questions||[]).map(q=>`
<p style="font-weight:bold;margin:8pt 0 4pt;">${q}</p>
<p style="border-bottom:1px solid #aaa;margin:4pt 0;height:16pt;">&nbsp;</p>
<p style="border-bottom:1px solid #aaa;margin:4pt 0;height:16pt;">&nbsp;</p>
<p style="border-bottom:1px solid #aaa;margin:4pt 0 10pt;height:16pt;">&nbsp;</p>
`).join("")
) : ""}
`;
    });
  } else if (data.sections) {
    data.sections.forEach((s, i) => {
      bodyHTML += `
${i > 0 ? pageBreak : ""}
<h2 style="font-size:14pt;color:#0ea5a0;border-bottom:2px solid #0ea5a0;padding-bottom:4pt;">${s.titre||s.question||`Section ${i+1}`}</h2>
${s.contenu ? `<p>${s.contenu.replace(/\n/g,"</p><p>")}</p>` : ""}
${s.reponse_courte ? `<p style="font-size:13pt;font-weight:bold;color:#0ea5a0;">&#8594; ${s.reponse_courte}</p><p>${s.explication||""}</p>` : ""}
${s.points_cles?.length ? box("#f0fdfa","#0ea5a0","Points clés",s.points_cles.map(p=>`<p style="margin:3pt 0;">&#10003; ${p}</p>`).join("")) : ""}
${s.emplacement_image ? box("#f0fdfa","#0ea5a0","","<p style='text-align:center;color:#0ea5a0;'>&#128444; "+s.emplacement_image+"</p>") : ""}
`;
    });
  }

  const planHTML = data.plan_action?.length ? `
${pageBreak}
<h2 style="font-size:15pt;color:#0ea5a0;">Plan d'action — 30 jours</h2>
${data.plan_action.map(s => box("#f8f9fa","#0ea5a0",`Semaine ${s.semaine} — ${s.objectif}`,(s.actions||[]).map(a=>`<p style="margin:3pt 0;">&#9633; &nbsp;${a}</p>`).join(""))).join("")}` : "";

  const checklistHTML = data.checklist?.length ? `
${pageBreak}
<h2 style="font-size:15pt;color:#0ea5a0;">Checklist d'actions</h2>
${data.checklist.map(item=>`<p style="margin:8pt 0;">&#9633; &nbsp;${item}</p>`).join("")}` : "";

  const imagesHTML = data.emplacements_images?.length ? `
${pageBreak}
<h2 style="font-size:14pt;color:#f5c842;">Images a generer sur ChatGPT</h2>
${data.emplacements_images.map(img => `<table width="100%" cellpadding="10" cellspacing="0" style="margin:8pt 0;border:2px solid #f5c842;border-collapse:collapse;"><tr><td style="background:#fffbeb;color:#92400e;text-align:center;">${img}</td></tr></table>`).join("")}` : "";

  const metaHTML = data.meta ? `
${pageBreak}
<table width="100%" cellpadding="12" cellspacing="0" style="border:1px solid #ddd;border-collapse:collapse;font-size:10pt;">
  <tr><td style="background:#f8f9fa;">
    <p style="font-weight:bold;font-size:12pt;margin:0 0 10pt;">FICHE COMMERCIALE — Ne pas publier</p>
    <p><strong>Prix :</strong> ${data.meta.prix_suggere_fcfa?.toLocaleString()} FCFA / ${data.meta.prix_suggere_eur}€</p>
    <p><strong>Public cible :</strong> ${data.meta.public_cible}</p>
    <p><strong>Titre SEO :</strong> ${data.meta.titre_seo}</p>
    <p><strong>Tags :</strong> ${data.meta.tags?.join(", ")}</p>
    <p><strong>Description vente :</strong><br>${data.meta.description_vente}</p>
  </td></tr>
</table>` : "";

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="UTF-8">
<style>
  body{font-family:Georgia,serif;font-size:12pt;color:#1a1a2e;line-height:1.8;margin:2cm;}
  h1{font-size:24pt;color:#0ea5a0;text-align:center;}
  h2{font-size:14pt;color:#0ea5a0;}
  p{margin:5pt 0;}
  table{width:100%;}
</style></head><body>

<p style="text-align:center;background:#0ea5a0;color:white;padding:6pt;font-weight:bold;font-size:10pt;">Medecin+ | ${format?.label}</p>
<h1>${data.titre || ""}</h1>
<p style="text-align:center;color:#888;font-style:italic;font-size:13pt;">${data.sous_titre || ""}</p>
${data.accroche ? `<p style="text-align:center;font-size:12pt;color:#555;font-style:italic;">"${data.accroche}"</p>` : ""}
<p style="text-align:center;color:#aaa;font-size:10pt;">${new Date().toLocaleDateString("fr-FR", { year:"numeric", month:"long" })}</p>

<br clear="all" style="page-break-before:always;" />
<h2>Introduction</h2>
<table width="100%" cellpadding="14" cellspacing="0" style="margin:14pt 0;border-collapse:collapse;">
  <tr><td style="background:#f0fdfa;border-left:5px solid #0ea5a0;">
    <p>${(data.introduction || "").replace(/\n/g, "</p><p>")}</p>
  </td></tr>
</table>

${bodyHTML}

<br clear="all" style="page-break-before:always;" />
<table width="100%" cellpadding="20" cellspacing="0" style="border-collapse:collapse;">
  <tr><td style="background:#0ea5a0;color:white;">
    <h2 style="color:white;margin:0 0 8pt;">Conclusion</h2>
    <p>${(data.conclusion || "").replace(/\n/g, "</p><p>")}</p>
  </td></tr>
</table>

${planHTML}
${checklistHTML}
${imagesHTML}
${metaHTML}

<p style="text-align:center;color:#aaa;font-size:9pt;margin-top:20pt;">Medecin+ — Draft a peaufiner avant publication</p>
</body></html>`;
}

export default function MedecinPlus() {
  const [tab, setTab] = useState("creer");
  const [sujet, setSujet] = useState("");
  const [formatId, setFormatId] = useState("ebook");
  const [longueur, setLongueur] = useState("court");
  const [step, setStep] = useState("form");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [bibliotheque, setBibliotheque] = useState([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mp_v3_library");
      if (saved) setBibliotheque(JSON.parse(saved));
    } catch {}
  }, []);

  const saveToLibrary = (item) => {
    const updated = [item, ...bibliotheque].slice(0, 100);
    setBibliotheque(updated);
    try { localStorage.setItem("mp_v3_library", JSON.stringify(updated)); } catch {}
  };

  const generate = async () => {
    if (!sujet.trim()) return;
    setStep("generating");
    setProgress(5);
    setError(null);

    const isEbook = formatId === "ebook";
    const labels = isEbook
      ? ["Initialisation...", "Génération des chapitres...", "Création du quiz...", "Génération du workbook...", "Plan d'action 30 jours...", "Métadonnées commerciales...", "Finalisation..."]
      : ["Initialisation...", "Connexion à l'IA...", "Génération du contenu...", "Structuration...", "Finalisation..."];
    const progValues = isEbook ? [10, 25, 40, 55, 70, 85, 95] : [10, 30, 55, 75, 90];

    let si = 0;
    const interval = setInterval(() => {
      if (si < labels.length) { setProgress(progValues[si]); setProgressLabel(labels[si]); si++; }
    }, isEbook ? 1200 : 900);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sujet, formatId, longueur }),
      });

      clearInterval(interval);
      setProgress(97);
      setProgressLabel("Traitement final...");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const item = {
        id: Date.now(),
        sujet, formatId, longueur,
        titre: data.titre,
        sous_titre: data.sous_titre,
        data,
        date: new Date().toLocaleDateString("fr-FR"),
      };

      saveToLibrary(item);
      setResult(item);
      setProgress(100);
      setProgressLabel("✓ Prêt !");
      setTimeout(() => setStep("result"), 300);
    } catch (err) {
      clearInterval(interval);
      setError("Erreur : " + err.message);
      setStep("form");
    }
  };

  const downloadWord = (item) => {
    setDownloading(true);
    try {
      const html = generateWordHTML(item.data, item.formatId);
      const blob = new Blob([html], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(item.titre || "produit").replace(/[^\w\s]/g, "").trim().replace(/\s+/g, "_")}_MedecinPlus.doc`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(e) { alert("Erreur téléchargement"); }
    setDownloading(false);
  };

  const reset = () => { setStep("form"); setSujet(""); setFormatId("ebook"); setLongueur("court"); setResult(null); setError(null); };

  const fmt = FORMATS.find(f => f.id === formatId);
  const lng = LONGUEURS.find(l => l.id === longueur);
  const card = { background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: "14px", padding: "20px", marginBottom: "16px" };

  return (
    <>
      <Head>
        <title>Médecin+ | Usine de Produits Digitaux Santé</title>
        <meta name="description" content="Générez des ebooks, guides et programmes santé de haute qualité" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: "100vh", background: PALETTE.bg, fontFamily: "'Inter', sans-serif", padding: "20px 16px" }}>
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder { color: ${PALETTE.subtle}; } input:focus { outline: none; border-color: ${PALETTE.teal} !important; } @keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} } button:hover { opacity:0.88; }`}</style>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "28px", animation: "fadeIn 0.5s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: PALETTE.tealDim, border: `1px solid ${PALETTE.teal}40`, borderRadius: "24px", padding: "6px 16px", marginBottom: "12px" }}>
            <span style={{ color: PALETTE.teal, fontSize: "11px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>Médecin+</span>
            <span style={{ background: PALETTE.gold, color: "#000", fontSize: "9px", fontWeight: "800", padding: "2px 6px", borderRadius: "8px" }}>V3</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: PALETTE.text, fontSize: "clamp(22px, 5vw, 32px)", fontWeight: "800", margin: "0 0 6px" }}>Usine de Produits Digitaux Santé</h1>
          <p style={{ color: PALETTE.muted, fontSize: "13px" }}>Ebook Premium · Quiz · Workbook · Plan 30j · Multi-plateformes</p>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", background: PALETTE.surface, borderRadius: "12px", padding: "4px", maxWidth: "640px", margin: "0 auto 20px" }}>
          {[["creer", "✦ Créer"], ["bibliotheque", `📚 Bibliothèque (${bibliotheque.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", cursor: "pointer", background: tab === id ? PALETTE.teal : "transparent", color: tab === id ? "white" : PALETTE.muted, fontWeight: tab === id ? "700" : "500", fontSize: "13px", transition: "all 0.2s" }}>{label}</button>
          ))}
        </div>

        {tab === "creer" && (
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>

            {step === "form" && (
              <div style={{ animation: "fadeIn 0.4s ease" }}>
                {error && <div style={{ background: "#2d0a0a", border: "1px solid #dc2626", color: "#fca5a5", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px" }}>⚠ {error}</div>}

                <div style={card}>
                  <label style={{ color: PALETTE.muted, fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>Sujet du produit</label>
                  <input value={sujet} onChange={e => setSujet(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()} placeholder="Ex: L'hypertension artérielle, Le diabète..." style={{ width: "100%", padding: "13px 15px", background: PALETTE.surface, border: `2px solid ${sujet ? PALETTE.teal : PALETTE.border}`, borderRadius: "10px", color: PALETTE.text, fontSize: "14px", transition: "border-color 0.2s" }} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                    {EXEMPLES.map(ex => (
                      <button key={ex} onClick={() => setSujet(ex)} style={{ background: sujet === ex ? PALETTE.tealDim : "rgba(255,255,255,0.03)", color: sujet === ex ? PALETTE.teal : PALETTE.muted, border: `1px solid ${sujet === ex ? PALETTE.teal + "60" : PALETTE.border}`, padding: "4px 10px", borderRadius: "16px", fontSize: "11px", cursor: "pointer" }}>{ex}</button>
                    ))}
                  </div>
                </div>

                <div style={card}>
                  <label style={{ color: PALETTE.muted, fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>Type de produit</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {FORMATS.map(f => (
                      <button key={f.id} onClick={() => setFormatId(f.id)} style={{ background: formatId === f.id ? PALETTE.tealDim : "rgba(255,255,255,0.02)", border: `1.5px solid ${formatId === f.id ? PALETTE.teal : PALETTE.border}`, borderRadius: "10px", padding: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                        <div style={{ fontSize: "18px", marginBottom: "4px" }}>{f.icon}</div>
                        <div style={{ color: formatId === f.id ? PALETTE.teal : PALETTE.text, fontWeight: "700", fontSize: "13px" }}>{f.label}</div>
                        <div style={{ color: PALETTE.muted, fontSize: "11px" }}>{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={card}>
                  <label style={{ color: PALETTE.muted, fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>Longueur</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {LONGUEURS.map(l => (
                      <button key={l.id} onClick={() => setLongueur(l.id)} style={{ background: longueur === l.id ? PALETTE.tealDim : "rgba(255,255,255,0.02)", border: `1.5px solid ${longueur === l.id ? PALETTE.teal : PALETTE.border}`, borderRadius: "10px", padding: "14px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                        <div style={{ color: longueur === l.id ? PALETTE.teal : PALETTE.text, fontWeight: "700", fontSize: "14px" }}>{l.label}</div>
                        <div style={{ color: PALETTE.muted, fontSize: "11px", marginTop: "2px" }}>{l.pages}</div>
                        <div style={{ color: PALETTE.gold, fontSize: "11px", fontWeight: "600", marginTop: "4px" }}>{l.prix}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {sujet && (
                  <div style={{ ...card, background: PALETTE.tealDim, border: `1px solid ${PALETTE.teal}40`, marginBottom: "14px" }}>
                    <p style={{ color: PALETTE.text, fontSize: "13px", margin: 0 }}>
                      <strong style={{ color: PALETTE.teal }}>{fmt?.icon} {fmt?.label}</strong> · <strong>{lng?.label}</strong> sur <strong>"{sujet}"</strong>
                      <br /><span style={{ color: PALETTE.muted, fontSize: "11px" }}>{lng?.pages} · {lng?.prix}</span>
                    </p>
                  </div>
                )}

                <button onClick={generate} disabled={!sujet.trim()} style={{ width: "100%", padding: "15px", background: sujet.trim() ? PALETTE.teal : PALETTE.subtle, color: sujet.trim() ? "white" : PALETTE.muted, border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: sujet.trim() ? "pointer" : "not-allowed", fontFamily: "'Playfair Display', serif", transition: "all 0.2s" }}>
                  ✦ Générer le draft
                </button>
              </div>
            )}

            {step === "generating" && (
              <div style={{ textAlign: "center", padding: "60px 20px", animation: "fadeIn 0.4s ease" }}>
                <div style={{ width: "60px", height: "60px", border: `3px solid ${PALETTE.tealDim}`, borderTop: `3px solid ${PALETTE.teal}`, borderRadius: "50%", margin: "0 auto 22px", animation: "spin 1s linear infinite" }} />
                <h2 style={{ fontFamily: "'Playfair Display', serif", color: PALETTE.text, fontSize: "20px", marginBottom: "8px" }}>Génération en cours...</h2>
                <p style={{ color: PALETTE.muted, fontSize: "13px", marginBottom: "28px", animation: "pulse 1.5s ease infinite" }}>{progressLabel}</p>
                <div style={{ background: PALETTE.surface, borderRadius: "20px", height: "5px", overflow: "hidden", maxWidth: "320px", margin: "0 auto 8px" }}>
                  <div style={{ height: "100%", background: `linear-gradient(90deg, ${PALETTE.teal}, #14b8b2)`, borderRadius: "20px", width: `${progress}%`, transition: "width 0.8s ease" }} />
                </div>
                <p style={{ color: PALETTE.subtle, fontSize: "11px" }}>{progress}%</p>
                {formatId === "ebook" && <p style={{ color: PALETTE.subtle, fontSize: "11px", marginTop: "12px" }}>Ebook Premium · Quiz + Workbook + Plan 30j</p>}
              </div>
            )}

            {step === "result" && result && (
              <div style={{ animation: "fadeIn 0.4s ease" }}>
                <div style={{ ...card, border: `1px solid ${PALETTE.teal}50`, background: PALETTE.tealDim, marginBottom: "16px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div style={{ width: "34px", height: "34px", background: PALETTE.teal, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>✓</div>
                    <div>
                      <p style={{ color: PALETTE.teal, fontWeight: "700", fontSize: "13px", marginBottom: "2px" }}>Draft généré avec succès</p>
                      <p style={{ color: PALETTE.muted, fontSize: "11px" }}>{fmt?.icon} {fmt?.label} · {lng?.label} · {(result.data.chapitres || result.data.sections)?.length} sections</p>
                    </div>
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", color: PALETTE.text, fontSize: "18px", marginBottom: "4px" }}>{result.titre}</h2>
                  <p style={{ color: PALETTE.muted, fontSize: "13px", fontStyle: "italic", marginBottom: "14px" }}>{result.sous_titre}</p>
                  {result.data.accroche && <div style={{ background: PALETTE.surface, borderLeft: `3px solid ${PALETTE.gold}`, padding: "10px 14px", borderRadius: "0 8px 8px 0", marginBottom: "14px" }}><p style={{ color: PALETTE.text, fontSize: "13px", fontStyle: "italic" }}>"{result.data.accroche}"</p></div>}

                  {result.formatId === "ebook" && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                      {[`📖 ${(result.data.chapitres || []).length} chapitres`, "🧠 Quiz intégré", "✍️ Workbook", "📅 Plan 30j"].map(tag => (
                        <span key={tag} style={{ background: "rgba(14,165,160,0.15)", color: PALETTE.teal, fontSize: "11px", padding: "3px 10px", borderRadius: "12px", fontWeight: "600" }}>{tag}</span>
                      ))}
                    </div>
                  )}

                  {result.data.meta && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {PLATEFORMES.map(p => (
                        <div key={p.id} style={{ background: p.color + "20", border: `1px solid ${p.color}40`, borderRadius: "8px", padding: "4px 10px" }}>
                          <span style={{ color: p.color, fontSize: "11px", fontWeight: "700" }}>{p.label}</span>
                          <span style={{ color: PALETTE.muted, fontSize: "11px" }}> · {result.data.meta.prix_suggere_fcfa?.toLocaleString()} FCFA</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => downloadWord(result)} disabled={downloading} style={{ width: "100%", padding: "14px", background: PALETTE.teal, color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "10px", transition: "all 0.2s" }}>
                  {downloading ? "⏳ Téléchargement..." : "⬇ Télécharger Word — Draft complet"}
                </button>
                <button onClick={reset} style={{ width: "100%", padding: "12px", background: "transparent", color: PALETTE.muted, border: `1px solid ${PALETTE.border}`, borderRadius: "12px", fontSize: "13px", cursor: "pointer" }}>+ Nouveau produit</button>
              </div>
            )}
          </div>
        )}

        {tab === "bibliotheque" && (
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            {bibliotheque.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <p style={{ fontSize: "32px", marginBottom: "12px" }}>📚</p>
                <p style={{ color: PALETTE.muted, fontSize: "14px" }}>Aucun produit généré. Commencez par créer votre premier draft.</p>
              </div>
            ) : (
              <div>
                <p style={{ color: PALETTE.muted, fontSize: "12px", marginBottom: "16px" }}>{bibliotheque.length} produit{bibliotheque.length > 1 ? "s" : ""}</p>
                {bibliotheque.map(item => {
                  const f = FORMATS.find(f => f.id === item.formatId);
                  const l = LONGUEURS.find(l => l.id === item.longueur);
                  return (
                    <div key={item.id} style={card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                            <span style={{ background: PALETTE.tealDim, color: PALETTE.teal, fontSize: "11px", padding: "2px 8px", borderRadius: "10px" }}>{f?.icon} {f?.label}</span>
                            <span style={{ background: "rgba(255,255,255,0.05)", color: PALETTE.muted, fontSize: "11px", padding: "2px 8px", borderRadius: "10px" }}>{l?.label}</span>
                            <span style={{ color: PALETTE.subtle, fontSize: "11px" }}>{item.date}</span>
                          </div>
                          <h3 style={{ fontFamily: "'Playfair Display', serif", color: PALETTE.text, fontSize: "15px", marginBottom: "3px" }}>{item.titre}</h3>
                          <p style={{ color: PALETTE.muted, fontSize: "12px", fontStyle: "italic" }}>{item.sous_titre}</p>
                          {item.data.meta && <p style={{ color: PALETTE.gold, fontSize: "11px", marginTop: "6px", fontWeight: "600" }}>{item.data.meta.prix_suggere_fcfa?.toLocaleString()} FCFA · {item.data.meta.prix_suggere_eur}€</p>}
                        </div>
                        <button onClick={() => downloadWord(item)} style={{ background: PALETTE.teal, color: "white", border: "none", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", cursor: "pointer", fontWeight: "600", flexShrink: 0 }}>⬇ Word</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
