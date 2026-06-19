// Soins de L'Atelier Géraldine Esther — repris du site geraldineesther.fr
// duree en minutes, prix en euros. masquerDuree = ne pas afficher la durée (programmes).
export const DEFAULT_SOINS = [
  // ── Soins énergétiques (présentiel) ──
  {id:'e1', cat:'Soins énergétiques', nom:'Énergie de lumière', duree:60, prix:70, cure:'60€ enfant (≤14 ans)',
   desc:"Libération émotionnelle, harmonisation des chakras et reconnexion à ton axe lumineux."},
  {id:'e2', cat:'Soins énergétiques', nom:'Renaissance', duree:60, prix:88, cure:'',
   desc:"Un reset intérieur pour tourner la page des anciens schémas et renaître à soi."},
  {id:'e3', cat:'Soins énergétiques', nom:'Vibre tes chakras', duree:60, prix:77, cure:'',
   desc:"Activation et alignement des chakras au son des bols tibétains et diapasons."},
  {id:'e7', cat:'Soins énergétiques', nom:'Sensei Soûl', duree:45, prix:88, cure:'',
   desc:"Faire le deuil et se délester des mémoires passées, avec ambre et aimants gravés."},
  {id:'e8', cat:'Soins énergétiques', nom:'Lahochi', duree:30, prix:50, cure:'40€ enfant (≤14 ans)',
   desc:"Canalisation d'énergie par apposition des mains. Détente profonde, apaisement du stress."},
  // ── Massages magnétiques ──
  {id:'m1', cat:'Massages magnétiques', nom:'Bye Bye C', duree:45, prix:70, cure:'Cure de 4 séances — 240€',
   desc:"Massage magnétique libérateur de cellulite. La silhouette se redessine, les jambes s'allègent."},
  {id:'m2', cat:'Massages magnétiques', nom:'Koharu', duree:45, prix:70, cure:'3 séances 195€ · 5 séances 300€',
   desc:"Rituel magnétique du visage. Les traits se détendent, l'éclat naturel se révèle."},
  {id:'m3', cat:'Massages magnétiques', nom:'Lymphflow', duree:60, prix:120, cure:'3 séances 330€ · 5 séances 500€ · module haut/bas 30 min 65€',
   desc:"Drainage énergétique intuitif. Jambes plus légères, ventre dégonflé, immunité renforcée."},
  {id:'m4', cat:'Massages magnétiques', nom:'The Body', duree:120, prix:140, cure:'',
   desc:"Massage immersif : gestes manuels, baguettes Kansa, huiles et énergie vibratoire."},
  // ── Rituels ──
  {id:'r1', cat:'Rituels', nom:'Voyage des sens', duree:60, prix:77, cure:'Soin signature · aussi en box à distance',
   desc:"Bain de pieds parfumé, méditation, pierres de lumière, réflexologie et massage enveloppant, scellé par un enveloppement chaud."},
  {id:'r2', cat:'Rituels', nom:'Le Rituel Hanashi', duree:120, prix:150, cure:'Rituel beauté japonais-coréen',
   desc:"Cérémonie immersive en 5 zones continues, avec Head spa : Kobido crânien et facial, mains, réflexologie plantaire et instruments sacrés."},
  // ── Programmes ──
  {id:'p1', cat:'Programmes', nom:'Divine Body Flow', duree:90, masquerDuree:true, prix:1111, cure:'Programme 5 semaines · 555€ en distanciel · paiement jusqu’à 10 fois possible',
   desc:"Programme holistique incluant KeyLight : soins drainants, massage anti-cellulite, hypno-méditation et activation du féminin sacré."},
  {id:'p2', cat:'Programmes', nom:'KeyLight', duree:60, prix:222, cure:'Rendez-vous visio · activation de l’anneau gastrique énergétique · paiement en 3 fois possible',
   desc:"Activation vibratoire de la satiété intérieure : un code de lumière posé dans les corps subtils."},
];

// Réglages modifiables depuis l'espace admin. (La clé Brevo et le numéro d'alerte
// restent côté serveur, dans les variables d'environnement Vercel.)
export const DEFAULT_CONFIG = {
  pause: 60,       // minutes de battement entre deux soins
  pas: 30,         // intervalle des créneaux proposés (minutes)
  delaiMin: 48,    // délai minimum (heures) avant un rendez-vous
  smsConfirm: "Bonjour {nom}, votre soin {soin} est bien reserve le {date} a {heure}. A tres vite, L'Atelier Geraldine Esther",
  smsJ1: "Bonjour {nom}, petit rappel : votre soin {soin} a lieu demain {date} a {heure}. Au plaisir, Geraldine Esther",
  smsJour: "Bonjour {nom}, c'est aujourd'hui ! Votre soin {soin} a {heure}. A tout a l'heure, Geraldine Esther",
};
  smsPostSoin: "Bonjour {nom}, j'espere que vous vous sentez bien apres votre soin {soin}. Ce fut un plaisir de vous recevoir. Au plaisir de vous revoir a l'Atelier, Geraldine Esther",
