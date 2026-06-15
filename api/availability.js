import { getAvailability, setAvailability, getReservations, getConfig } from '../lib/db.js';
import { isAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [dispos, reservations, config] = await Promise.all([
      getAvailability(), getReservations(), getConfig(),
    ]);
    // On n'expose que ce qui est nécessaire au calcul des créneaux (aucune donnée personnelle)
    const busy = reservations
      .filter(r => r.statut !== 'annulé')
      .map(r => ({ date: r.date, heure: r.heure, duree: r.duree }));
    return res.status(200).json({
      dispos, busy,
      pause: config.pause, pas: config.pas, delaiMin: config.delaiMin,
    });
  }
  if (req.method === 'POST') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Non autorisé' });
    await setAvailability(req.body && req.body.dispos ? req.body.dispos : {});
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Méthode non permise' });
}
