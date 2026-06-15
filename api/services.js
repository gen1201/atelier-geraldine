import { getServices, setServices } from '../lib/db.js';
import { isAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(await getServices());
  }
  if (req.method === 'POST') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Non autorisé' });
    if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Format invalide' });
    await setServices(req.body);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Méthode non permise' });
}
