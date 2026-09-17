import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { JsonDataService } from "../../../core/services/json-data.service";
import {
  ConfigMesi,
  PeriodEntry,
  SeasonKey,
  StagioniConfig,
  Storico,
  YearStat,
} from "../../../core/models/data.models";
import {
  formatItalianNumber,
  formatNumber,
  pluralizza,
} from "../../../core/services/number-format.service";
import { ItalianNumberPipe } from "../../../core/pipes/italian-number.pipe";
import { ScrollRevealDirective } from "../../../shared/scroll-reveal/scroll-reveal.directive";

type Metrica = "km" | "mesiPercorsi" | "kmMedio";

interface RigaMese {
  mese: string;
  km: number;
  mesiPercorsi: number;
  kmMedio: number;
  percentuale: number;
}

interface RigaPeriodo {
  nome: string;
  km: number;
  percentuale: number;
  link: string[];
}

const MEDAGLIE = ["🥇", "🥈", "🥉"];
const NOME_STAGIONE: Record<string, SeasonKey> = {
  Primavera: "primavera",
  Estate: "estate",
  Autunno_Inverno: "autunno-inverno",
};

// ============================================================
// ClassificaMesiComponent — equivalente di
// Statistiche/History/classifica-mesi.html +
// JS/Statistiche/History/classifica-mesi/**
//
// Due schede, come nell'originale: "Mesi" (podio dei 12 mesi,
// ordinabile per km totali / anni pedalati / media mensile) e
// "Periodi" (podio di TUTTI i singoli periodi del sito, es.
// "Primavera 2021", cliccabili verso la pagina del periodo).
// ============================================================
@Component({
  selector: "app-classifica-mesi",
  standalone: true,
  imports: [CommonModule, RouterLink, ItalianNumberPipe, ScrollRevealDirective],
  templateUrl: "./classifica-mesi.component.html",
  styleUrl: "./classifica-mesi.component.css",
})
export class ClassificaMesiComponent implements OnInit {
  private readonly json = inject(JsonDataService);

  scheda: "mesi" | "periodi" = "mesi";
  metrica: Metrica = "km";

  righeMesi: RigaMese[] = [];
  righePeriodi: RigaPeriodo[] = [];
  caricamento = true;

  readonly medaglie = MEDAGLIE;

  async ngOnInit(): Promise<void> {
    const [storico, configMesi, stagioniConfig] = await Promise.all([
      this.json.leggiOppureNull<Storico>(
        "json/Statistiche/History/Storico.json",
      ),
      this.json.leggiOppureNull<ConfigMesi>(
        "json/Statistiche/History/config-mesi.json",
      ),
      this.json.leggiOppureNull<StagioniConfig>(
        "json/Statistiche/anni/stagioni/stagioni.json",
      ),
    ]);

    const mesiOrdine = configMesi
      ? Object.keys(configMesi.orderMesi).sort(
          (a, b) => configMesi.orderMesi[a] - configMesi.orderMesi[b],
        )
      : [
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

    if (storico) {
      const allData = await this.json.leggiTutti<YearStat>(
        Object.values(storico.anni),
      );
      const km = new Array(mesiOrdine.length).fill(0);
      const anni = new Array(mesiOrdine.length).fill(0);

      allData.forEach((jsonAnno) => {
        mesiOrdine.forEach((mese, i) => {
          if (jsonAnno?.data?.[mese]) {
            km[i] += jsonAnno.data[mese];
            anni[i] += 1;
          }
        });
      });

      const totale = km.reduce((a, b) => a + b, 0);
      this.righeMesi = mesiOrdine.map((mese, i) => ({
        mese,
        km: km[i],
        mesiPercorsi: anni[i],
        kmMedio: anni[i] > 0 ? km[i] / anni[i] : 0,
        percentuale: totale > 0 ? (km[i] / totale) * 100 : 0,
      }));
    }

    if (stagioniConfig) {
      const righe: RigaPeriodo[] = [];
      for (const stagione of stagioniConfig.seasons) {
        const seasonKey = NOME_STAGIONE[stagione.name] ?? "primavera";
        for (const [anno, percorso] of Object.entries(stagione.subPeriods)) {
          const dati = await this.json.leggiOppureNull<PeriodEntry[]>(percorso);
          const km = (dati ?? []).reduce((s, r) => s + (r.distance || 0), 0);
          righe.push({
            nome: `${stagione.displayName} ${anno}`,
            km,
            percentuale: 0,
            link: ["/", seasonKey, anno],
          });
        }
      }
      const totalePeriodi = righe.reduce((s, r) => s + r.km, 0);
      righe.forEach(
        (r) =>
          (r.percentuale =
            totalePeriodi > 0 ? (r.km / totalePeriodi) * 100 : 0),
      );
      righe.sort((a, b) => b.km - a.km);
      this.righePeriodi = righe;
    }

    this.caricamento = false;
  }

  righeOrdinate(): RigaMese[] {
    return [...this.righeMesi].sort(
      (a, b) => (b[this.metrica] || 0) - (a[this.metrica] || 0),
    );
  }

  formattaValore(r: RigaMese): string {
    if (this.metrica === "mesiPercorsi") {
      return `${formatItalianNumber(r.mesiPercorsi)} ${pluralizza(r.mesiPercorsi, "anno", "anni")}`;
    }
    if (this.metrica === "kmMedio") {
      return `${formatItalianNumber(r.kmMedio, true)} km`;
    }
    return `${formatItalianNumber(r.km)} km`;
  }

  formatNumber = formatNumber;
  formatItalianNumber = formatItalianNumber;
}
