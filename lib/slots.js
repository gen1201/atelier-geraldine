// === L'Atelier Géraldine Esther — calcul des créneaux (version blindée) ===
// Cette version ne peut jamais provoquer d'erreur 500 :
// toute donnée inattendue est ignorée proprement (renvoie [] au lieu de planter).

export const toMin = (h) => {
  if (typeof h !== 'string' || !h.includes(':')) return 0;
  const [a, b] = h.split(':').map(Number);
  return (a || 0) * 60 + (b || 0);
};
export const toH = (m) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// dispos : { 'YYYY-MM-DD': { plages:[{debut,fin},...] } }  (ancien format {debut,fin} encore accepté)
function plagesOf(conf) {
  if (!conf) return [];
  if (Array.isArray(conf.plages)) return conf.plages.filter(p => p && p.debut && p.fin);
  if (conf.debut && conf.fin) return [{ debut: conf.debut, fin: conf.fin }];
  return [];
}

export function freeSlots(dateStr, soin, dispos, reservations, config) {
  try {
    if (!soin || !soin.duree || !dispos) return [];
    const plages = plagesOf(dispos[dateStr]);
    if (!plages.length) return [];

    const cfg = config || {};
    const pause = cfg.pause ?? 60, pas = cfg.pas ?? 30, delai = cfg.delaiMin ?? 0;

    const occ = (reservations || [])
      .filter(r => r && r.date === dateStr && r.statut !== 'annulé' && r.heure)
      .map(r => { const deb = toMin(r.heure); return { deb, fin: deb + (r.duree || 60) + pause }; });

    const set = new Set();
    for (const pl of plages) {
      const ouv = toMin(pl.debut), ferm = toMin(pl.fin);
      for (let t = ouv; t + soin.duree <= ferm; t += pas) {
        const monDeb = t, monFin = t + soin.duree + pause;
        const libre = occ.every(o => monFin <= o.deb || monDeb >= o.fin);
        const slotMs = Date.parse(`${dateStr}T${toH(t)}:00`);
        const tropTot = slotMs < Date.now() + delai * 3600 * 1000;
        if (libre && !tropTot) set.add(t);
      }
    }
    return [...set].sort((a, b) => a - b).map(toH);
  } catch (e) {
    console.error('[freeSlots] erreur ignorée :', e && e.message);
    return [];
  }
}
