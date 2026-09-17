import { Injectable, inject } from "@angular/core";
import { JsonDataService } from "./json-data.service";
import { PeriodEntry, Storico } from "../models/data.models";
import { formatNumber } from "./number-format.service";

// ============================================================
// SearchService
//
// Porting fedele di JS/assets/ui/ricerca-diario/dati-condivisi.js:
// stessa logica per capire in quali file di periodo cercare una
// data, stesso calcolo dell'anno "vero" per le uscite
// Autunno-Inverno (il file copre due anni civili), stesso
// ordinamento a 6 criteri usato da "Cerca per data" e "Cerca per
// posto".
// ============================================================

export interface Candidato {
  stagione: string;
  url: string;
  annoInizio?: number;
  annoFine?: number;
}

export interface Uscita {
  stagione: string;
  data: string;
  anno: number;
  etichetta: string;
  postoHtml: string;
  postoTesto: string;
  distanza: number;
  chiaveData: number;
}

export type CriterioOrdine =
  | "alfabetico"
  | "alfabetico-desc"
  | "data-vecchio"
  | "data-recente"
  | "distanza-lungo"
  | "distanza-corto";

const MESI = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

// Nei file Autunno-Inverno (es. "2024-2025.json") i mesi Gennaio-Aprile
// appartengono al secondo anno della coppia, gli altri al primo.
const MESI_SECONDO_ANNO = ["Gennaio", "Febbraio", "Marzo", "Aprile"];

@Injectable({ providedIn: "root" })
export class SearchService {
  private readonly json = inject(JsonDataService);

  primavera(anno: number): Candidato {
    return {
      stagione: "Primavera",
      url: `json/Primavera/Periodi/${anno}.json`,
    };
  }

  estate(anno: number): Candidato {
    return { stagione: "Estate", url: `json/Estate/Periodi/${anno}.json` };
  }

  autunnoInverno(annoInizio: number, annoFine: number): Candidato {
    return {
      stagione: "Autunno - Inverno",
      url: `json/Autunno_Inverno/Periodi/${annoInizio}-${annoFine}.json`,
      annoInizio,
      annoFine,
    };
  }

  /** Candidati per una data precisa (mese + anno): stessi confini stagionali dell'originale. */
  candidatiPerData(meseIndice: number, anno: number): Candidato[] {
    switch (meseIndice) {
      case 0:
      case 1:
        return [this.autunnoInverno(anno - 1, anno)];
      case 2:
      case 3:
        return [this.primavera(anno), this.autunnoInverno(anno - 1, anno)];
      case 4:
      case 5:
        return [this.primavera(anno), this.estate(anno)];
      case 6:
      case 7:
      case 8:
        return [this.estate(anno)];
      case 9:
        return [this.estate(anno), this.autunnoInverno(anno, anno + 1)];
      case 10:
      case 11:
        return [this.autunnoInverno(anno, anno + 1)];
      default:
        return [];
    }
  }

  /** Tutti i file di periodo del sito, per la ricerca per posto. */
  async tuttiICandidati(): Promise<Candidato[]> {
    const storico = await this.json.leggiOppureNull<Storico>(
      "json/Statistiche/History/Storico.json",
    );
    const anni = storico?.anni
      ? Object.keys(storico.anni)
          .map(Number)
          .sort((a, b) => a - b)
      : [2020, 2021, 2022, 2023, 2024, 2025, 2026];

    const candidati: Candidato[] = [];
    anni.forEach((anno) => {
      candidati.push(this.primavera(anno));
      candidati.push(this.estate(anno));
      candidati.push(this.autunnoInverno(anno, anno + 1));
    });
    return candidati;
  }

  private annoDaUrl(url: string): number {
    const trovato = url.match(/(\d{4})\.json$/);
    return trovato ? parseInt(trovato[1], 10) : 0;
  }

  /** Estrae solo il testo da un campo "place" (puo' contenere un link <a>). */
  testoPosto(html: string): string {
    const contenitore = document.createElement("div");
    contenitore.innerHTML = html;
    return (contenitore.textContent || "").trim();
  }

  normalizza(testo: string): string {
    return testo
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("it");
  }

  /** Legge una lista di candidati e restituisce tutte le uscite trovate, arricchite. */
  async leggiUscite(candidati: Candidato[]): Promise<Uscita[]> {
    const risposte = await Promise.all(
      candidati.map((c) => this.json.leggiOppureNull<PeriodEntry[]>(c.url)),
    );

    const uscite: Uscita[] = [];
    risposte.forEach((dati, indice) => {
      if (!dati) return;
      const candidato = candidati[indice];

      dati.forEach((giro) => {
        const parti = giro.date.split(" ");
        const giorno = parseInt(parti[0], 10);
        const mese = parti[1];
        const meseIndice = MESI.indexOf(mese);
        const anno =
          candidato.stagione === "Autunno - Inverno"
            ? MESI_SECONDO_ANNO.indexOf(mese) !== -1
              ? (candidato.annoFine as number)
              : (candidato.annoInizio as number)
            : this.annoDaUrl(candidato.url);

        uscite.push({
          stagione: candidato.stagione,
          data: giro.date,
          anno,
          etichetta: `${giro.date} ${anno}`,
          postoHtml: giro.place,
          postoTesto: this.testoPosto(giro.place),
          distanza: Number(giro.distance) || 0,
          chiaveData: anno * 10000 + (meseIndice + 1) * 100 + giorno,
        });
      });
    });

    return uscite;
  }

  private perData(a: Uscita, b: Uscita): number {
    return a.chiaveData - b.chiaveData;
  }

  private perAlfabeto(a: Uscita, b: Uscita): number {
    return a.postoTesto.localeCompare(b.postoTesto, "it", {
      sensitivity: "base",
    });
  }

  /** Ordina secondo uno dei 6 criteri dei bottoni "Ordina per". */
  ordina(uscite: Uscita[], criterio: CriterioOrdine): Uscita[] {
    const copia = uscite.slice();

    switch (criterio) {
      case "data-vecchio":
        copia.sort((a, b) => this.perData(a, b) || this.perAlfabeto(a, b));
        break;
      case "data-recente":
        copia.sort((a, b) => this.perData(b, a) || this.perAlfabeto(a, b));
        break;
      case "distanza-lungo":
        copia.sort((a, b) => b.distanza - a.distanza || this.perData(a, b));
        break;
      case "distanza-corto":
        copia.sort((a, b) => a.distanza - b.distanza || this.perData(a, b));
        break;
      case "alfabetico-desc":
        copia.sort((a, b) => this.perAlfabeto(b, a) || this.perData(a, b));
        break;
      case "alfabetico":
      default:
        copia.sort((a, b) => this.perAlfabeto(a, b) || this.perData(a, b));
        break;
    }

    return copia;
  }

  /** Ricerca per una o piu' date, opzionalmente filtrata per uno o piu' posti. */
  async cercaPerDate(date: Date[], posti: string[] = []): Promise<Uscita[]> {
    const mappa = new Map<string, Candidato>();
    date.forEach((d) => {
      this.candidatiPerData(d.getMonth(), d.getFullYear()).forEach((c) => {
        mappa.set(c.url, c);
      });
    });

    const uscite = await this.leggiUscite(Array.from(mappa.values()));
    const dateChiavi = new Set(
      date.map(
        (d) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(),
      ),
    );

    let risultati = uscite.filter((u) => dateChiavi.has(u.chiaveData));

    if (posti.length > 0) {
      const postiNorm = posti.map((p) => this.normalizza(p)).filter(Boolean);
      if (postiNorm.length > 0) {
        risultati = risultati.filter((u) =>
          postiNorm.some((p) => this.normalizza(u.postoTesto).includes(p)),
        );
      }
    }

    return this.ordina(risultati, "data-vecchio");
  }

  /** Ricerca per posto (sottostringa, senza distinguere accenti/maiuscole) in tutto il diario. */
  async cercaPerPosto(testo: string): Promise<Uscita[]> {
    const query = this.normalizza(testo.trim());
    if (!query) return [];

    const candidati = await this.tuttiICandidati();
    const uscite = await this.leggiUscite(candidati);
    const risultati = uscite.filter((u) =>
      this.normalizza(u.postoTesto).includes(query),
    );
    return this.ordina(risultati, "alfabetico");
  }

  formatNumber = formatNumber;
}
