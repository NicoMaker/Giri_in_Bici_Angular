// ============================================================
// asset-path.util.ts
//
// Nel sito originale ogni percorso "json/..." e "/img/..." e'
// relativo alla radice del sito statico. In Angular tutto cio' che
// sta sotto src/assets/ viene pubblicato sotto "/assets/". Questa
// funzione traduce i percorsi cosi' come compaiono, invariati, nei
// file JSON originali verso il percorso servito da Angular — senza
// mai toccare il contenuto dei JSON stessi.
// ============================================================

/** Traduce un percorso "json/..." o "/img/..." del sito originale nel percorso servito da Angular. */
export function resolveAssetPath(path: string): string {
  if (!path) return path;

  // Percorsi gia' assoluti verso l'esterno (http, https, //) restano intatti
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(path)) {
    return path;
  }

  let p = path.trim();

  if (p.startsWith("/img/")) return "assets/img/" + p.slice("/img/".length);
  if (p.startsWith("img/")) return "assets/img/" + p.slice("img/".length);
  if (p.startsWith("/json/")) return "assets/json/" + p.slice("/json/".length);
  if (p.startsWith("json/")) return "assets/json/" + p.slice("json/".length);
  if (p.startsWith("/css/")) return "assets/css/" + p.slice("/css/".length);
  if (p.startsWith("css/")) return "assets/css/" + p.slice("css/".length);

  return p;
}
