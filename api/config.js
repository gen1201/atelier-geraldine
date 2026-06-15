import { getConfig, setConfig } from '../lib/db.js';
import { isAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Non autorisé' });
  if (req.method === 'GET') {
    return res.status(200).json(await getConfig());
  }
  if (req.method === 'POST') {
    const allowed = ['pause', 'pas', 'delaiMin', 'smsConfirm', 'smsJ1', 'smsJour'];
    const patch = {};
    for (const k of allowed) if (k in (req.body || {})) patch[k] = req.body[k];
    await setConfig(patch);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Méthode non permise' });
}
