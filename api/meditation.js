// === L'Atelier Géraldine Esther — Méditation offerte (L'Élan Créateur) - v4 ===
// Enregistre l'email dans Brevo (liste optionnelle) et envoie la méditation par email.
// Ne plante jamais : si l'envoi email échoue, la page donne quand même accès à la méditation.

const MEDITATION_URL = process.env.MEDITATION_URL
  || 'https://drive.google.com/file/d/1l3Gkdoc3Z4vFbl5R8k8ui6QSMDTmuiLt/view?usp=sharing';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non permise' });

  const email = ((req.body && req.body.email) || '').trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Adresse email invalide' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('[meditation] BREVO_API_KEY manquante');
    // On donne quand même accès à la méditation
    return res.status(200).json({ ok: true, emailed: false, link: MEDITATION_URL });
  }

  // 1) Enregistrer le contact dans Brevo (et dans une liste si BREVO_LIST_ID est défini)
  const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : null;
  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({ email, updateEnabled: true, ...(listId ? { listIds: [listId] } : {}) }),
    });
  } catch (e) {
    console.error('[meditation] enregistrement contact échoué :', e && e.message);
  }

  // 2) Envoyer la méditation par email (nécessite un expéditeur validé : BREVO_SENDER_EMAIL)
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "L'Atelier Géraldine Esther";

  if (!senderEmail) {
    console.error('[meditation] BREVO_SENDER_EMAIL non configuré : envoi email ignoré (accès page OK)');
    return res.status(200).json({ ok: true, emailed: false, link: MEDITATION_URL });
  }

  const html = `
  <div style="font-family:Georgia,'Times New Roman',serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#463c2f;background:#f6f2e9;border-radius:14px">
    <p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#9f7e28;margin:0 0 6px">L'Élan Créateur</p>
    <h1 style="font-size:26px;font-weight:normal;margin:0 0 18px;color:#463c2f">Ta méditation offerte 🌿</h1>
    <p style="font-size:16px;line-height:1.6;margin:0 0 14px">Bonjour,</p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 22px">Merci d'avoir rejoint mon univers. Voici ta méditation, à écouter dans un moment rien qu'à toi, au calme. Laisse-toi porter 🌿</p>
    <p style="text-align:center;margin:0 0 26px">
      <a href="${MEDITATION_URL}" style="display:inline-block;background:#d4ac4a;color:#231803;text-decoration:none;padding:14px 28px;border-radius:30px;font-size:15px;letter-spacing:1px">Écouter ma méditation</a>
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 6px">Avec douceur,</p>
    <p style="font-size:17px;font-style:italic;color:#56755d;margin:0">L'Atelier Géraldine Esther</p>
  </div>`;

  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email }],
        subject: 'Ta méditation offerte 🌿 L\'Élan Créateur',
        htmlContent: html,
      }),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      console.error('[meditation] envoi email échec', r.status, JSON.stringify(e));
      return res.status(200).json({ ok: true, emailed: false, link: MEDITATION_URL });
    }
    return res.status(200).json({ ok: true, emailed: true, link: MEDITATION_URL });
  } catch (e) {
    console.error('[meditation] envoi email exception', e && e.message);
    return res.status(200).json({ ok: true, emailed: false, link: MEDITATION_URL });
  }
}
