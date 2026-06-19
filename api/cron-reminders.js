 import { getReservations, setReservations, getConfig } from '../lib/db.js';
import { sendSMS, fillTemplate } from '../lib/sms.js';

// Date au format YYYY-MM-DD dans le fuseau de Paris
function parisDay(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(d);
}

export default async function handler(req, res) {
  const auth = req.headers['authorization'] || '';
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const [reservations, config] = await Promise.all([getReservations(), getConfig()]);
  const today = parisDay(0);
  const tomorrow = parisDay(1);
  const ilya2jours = parisDay(-2);
  let envoyes = 0;

  for (const r of reservations) {
    if (r.statut !== 'confirmé') continue;
    r.sms = r.sms || {};
    if (r.date === tomorrow && !r.sms.j1) {
      const s = await sendSMS(r.tel, fillTemplate(config.smsJ1, r, r.soinNom));
      if (s.ok) { r.sms.j1 = Date.now(); envoyes++; }
    }
    if (r.date === today && !r.sms.jour) {
      const s = await sendSMS(r.tel, fillTemplate(config.smsJour, r, r.soinNom));
      if (s.ok) { r.sms.jour = Date.now(); envoyes++; }
    }
    if (r.date === ilya2jours && !r.sms.post) {
      const s = await sendSMS(r.tel, fillTemplate(config.smsPostSoin, r, r.soinNom));
      if (s.ok) { r.sms.post = Date.now(); envoyes++; }
    }
  }

  await setReservations(reservations);
  return res.status(200).json({ ok: true, envoyes, today, tomorrow, ilya2jours });
}
