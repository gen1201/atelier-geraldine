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

  // Alerte SMS à Géraldine
  const phone = process.env.GERALDINE_PHONE;
  if (phone) {
    await sendSMS(phone, `Nouvelle demande : ${rdv.prenom} ${rdv.nom}, ${soin.nom}, ${dateLisible(date)} a ${heure}. Tel ${rdv.tel}`);
  }

  return res.status(200).json({ ok: true });
}
