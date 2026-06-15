const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

export function dateLisible(s) {
  if (!s) return '';
  const [y, m, j] = s.split('-');
  return `${parseInt(j)} ${MOIS[parseInt(m) - 1]} ${y}`;
}

export function fillTemplate(tpl, rdv, soinNom) {
  return (tpl || '')
    .replace(/{nom}/g, rdv.prenom || rdv.nom || '')
    .replace(/{soin}/g, soinNom || rdv.soinNom || '')
    .replace(/{date}/g, dateLisible(rdv.date))
    .replace(/{heure}/g, rdv.heure || '');
}

// 06 12 34 56 78 -> 33612345678 (format attendu par Brevo : indicatif pays, sans + ni 0)
export function normPhone(t) {
  let n = (t || '').replace(/[^0-9]/g, '');
  if (n.startsWith('00')) n = n.slice(2);
  else if (n.startsWith('0')) n = '33' + n.slice(1);
  return n;
}

export async function sendSMS(to, content) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { ok: false, error: 'BREVO_API_KEY manquante' };
  const sender = (process.env.BREVO_SENDER || 'GEsoin').slice(0, 11);
  try {
    const res = await fetch('https://api.brevo.com/v3/transactionalSMS/send', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        type: 'transactional',
        unicodeEnabled: true,
        sender,
        recipient: normPhone(to),
        content,
      }),
    });
    if (res.ok) return { ok: true };
    const e = await res.json().catch(() => ({}));
    return { ok: false, error: e.message || ('HTTP ' + res.status) };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
}
