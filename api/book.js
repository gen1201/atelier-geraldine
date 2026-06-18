import { getServices, getAvailability, getReservations, setReservations, getConfig } from '../lib/db.js';
import { freeSlots } from '../lib/slots.js';
import { sendSMS, dateLisible } from '../lib/sms.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non permise' });

  const { soinId, date, heure, prenom, nom, tel, email, notes } = req.body || {};
  if (!soinId || !date || !heure || !prenom || !tel) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const [services, dispos, reservations, config] = await Promise.all([
    getServices(), getAvailability(), getReservations(), getConfig(),
  ]);

  const soin = services.find(s => s.id === soinId);
  if (!soin) return res.status(400).json({ error: 'Soin introuvable' });

  // Vérification serveur : le créneau est bien libre et respecte le délai de 48h
  const slots = freeSlots(date, soin, dispos, reservations, config);
  if (!slots.includes(heure)) {
    return res.status(409).json({ error: 'Ce créneau n’est plus disponible' });
  }

  const rdv = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    soinId, soinNom: soin.nom, duree: soin.duree, prix: soin.prix,
    date, heure,
    prenom: String(prenom).trim(), nom: String(nom || '').trim(),
    tel: String(tel).trim(), email: String(email || '').trim(), notes: String(notes || '').trim(),
    statut: 'en attente', cree: Date.now(), sms: {},
  };
  reservations.push(rdv);
  await setReservations(reservations);

  // Alerte EMAIL à Géraldine (nouvelle demande) — fiable, remplace le SMS vers soi-même
  const alertEmail = process.env.GERALDINE_EMAIL || 'gen1201@hotmail.fr';
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (apiKey && senderEmail) {
    const html = `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:24px;color:#463c2f">
        <h2 style="color:#56755d;font-weight:normal">Nouvelle demande de réservation 🌿</h2>
        <p style="font-size:16px;line-height:1.7">
          <strong>${rdv.prenom} ${rdv.nom}</strong><br>
          Soin : <strong>${soin.nom}</strong><br>
          Date : <strong>${dateLisible(date)} à ${heure}</strong><br>
          Téléphone : <strong>${rdv.tel}</strong><br>
          ${rdv.email ? `Email : ${rdv.email}<br>` : ''}
          ${rdv.notes ? `Note : ${rdv.notes}<br>` : ''}
        </p>
        <p style="font-size:15px;color:#9f7e28">Pense à confirmer ce rendez-vous dans ton espace pour envoyer la confirmation à ta cliente.</p>
      </div>`;
    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
        body: JSON.stringify({
          sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || "L'Atelier Géraldine Esther" },
          to: [{ email: alertEmail }],
          subject: 'Nouvelle demande de réservation 🌿',
          htmlContent: html,
        }),
      });
    } catch (e) { console.error('[book] alerte email échouée :', e && e.message); }
  }

  return res.status(200).json({ ok: true });
}
