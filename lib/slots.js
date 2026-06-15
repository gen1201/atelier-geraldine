export const toMin = (h) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
export const toH = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// dispos : { 'YYYY-MM-DD': {debut:'09:00', fin:'18:00'} }
// reservations : tableau de RDV avec {date, heure, duree, statut}
export function freeSlots(dateStr, soin, dispos, reservations, config) {
  const conf = dispos[dateStr];
  if (!conf) return [];
  const ouv = toMin(conf.debut), ferm = toMin(conf.fin);
  const pause = config.pause ?? 60, pas = config.pas ?? 30, delai = config.delaiMin ?? 0;

  const occ = (reservations || [])
    .filter(r => r.date === dateStr && r.statut !== 'annulé')
    .map(r => { const deb = toMin(r.heure); return { deb, fin: deb + (r.duree || 60) + pause }; });

  const res = [];
  for (let t = ouv; t + soin.duree <= ferm; t += pas) {
    const monDeb = t, monFin = t + soin.duree + pause;
    const libre = occ.every(o => monFin <= o.deb || monDeb >= o.fin);
    const slotMs = Date.parse(`${dateStr}T${toH(t)}:00`);
    const tropTot = slotMs < Date.now() + delai * 3600 * 1000;
    if (libre && !tropTot) res.push(toH(t));
  }
  return res;
}
