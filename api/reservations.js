import { getReservations } from '../lib/db.js';
import { isAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Non autorisé' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non permise' });
  return res.status(200).json(await getReservations());
}
