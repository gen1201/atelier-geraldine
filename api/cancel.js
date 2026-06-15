import { getReservations, setReservations } from '../lib/db.js';
import { isAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non permise' });
  if (!isAdmin(req)) return res.status(401).json({ error: 'Non autorisé' });

  const { id } = req.body || {};
  const reservations = await getReservations();
  const rdv = reservations.find(r => r.id === id);
  if (!rdv) return res.status(404).json({ error: 'Rendez-vous introuvable' });

  rdv.statut = 'annulé';
  await setReservations(reservations);
  return res.status(200).json({ ok: true });
}
