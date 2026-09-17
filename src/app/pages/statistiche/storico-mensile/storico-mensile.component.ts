import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { JsonDataService } from "../../../core/services/json-data.service";
import {
  ConfigMesi,
  Storico,
  YearStat,
} from "../../../core/models/data.models";
import { formatNumber } from "../../../core/services/number-format.service";
import { ItalianNumberPipe } from "../../../core/pipes/italian-number.pipe";
import { ScrollRevealDirective } from "../../../shared/scroll-reveal/scroll-reveal.directive";

interface Cella {
  km: number;
  variazione: number | null;
}

interface RigaAnno {
  anno: string;
  colore: string;
  celle: Cella[];
  totale: number;
}

// ============================================================
// StoricoMensileComponent — equivalente di
// Statistiche/History/storico-mensile.html +
// JS/Statistiche/History/storico-mensile/**
//
// Una riga per anno, dodici colonne (i mesi, ordine da
// config-mesi.json), colore dell'anno da Storico.json.coloriAnni
// (stessa tavolozza della pagina Statistiche). Ogni cella mostra il
// km del mese e la variazione % rispetto allo stesso mese
// dell'anno precedente, con lo stesso calcolo di variazioni.js.
// ============================================================
@Component({
  selector: "app-storico-mensile",
  standalone: true,
  imports: [CommonModule, RouterLink, ItalianNumberPipe, ScrollRevealDirective],
  templateUrl: "./storico-mensile.component.html",
  styleUrl: "./storico-mensile.component.css",
})
export class StoricoMensileComponent implements OnInit {
  private readonly json = inject(JsonDataService);

  mesi: string[] = [];
  righe: RigaAnno[] = [];
  caricamento = true;

  async ngOnInit(): Promise<void> {
    const [storico, configMesi] = await Promise.all([
      this.json.leggiOppureNull<Storico>(
        "json/Statistiche/History/Storico.json",
      ),
      this.json.leggiOppureNull<ConfigMesi>(
        "json/Statistiche/History/config-mesi.json",
      ),
    ]);

    if (!storico) {
      this.caricamento = false;
      return;
    }

    this.mesi = configMesi
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

    const anni = Object.keys(storico.anni).sort();
    const palette = storico.coloriAnni?.length ? storico.coloriAnni : ["blue"];

    const datiPerAnno = await Promise.all(
      anni.map((anno) =>
        this.json.leggiOppureNull<YearStat>(storico.anni[anno]),
      ),
    );

    const valoriMensiliPerAnno: number[][] = datiPerAnno.map((dati) =>
      this.mesi.map((mese) => dati?.data?.[mese] ?? 0),
    );

    this.righe = anni.map((anno, indiceAnno) => {
      const valori = valoriMensiliPerAnno[indiceAnno];
      const celle: Cella[] = valori.map((km, indiceMese) => {
        const precedente =
          indiceAnno > 0 ? valoriMensiliPerAnno[indiceAnno - 1][indiceMese] : 0;
        const variazione =
          precedente === 0 ? null : ((km - precedente) / precedente) * 100;
        return { km, variazione };
      });
      return {
        anno,
        colore: palette[indiceAnno % palette.length],
        celle,
        totale: valori.reduce((a, b) => a + b, 0),
      };
    });

    this.caricamento = false;
  }

  segno(v: number): string {
    return v > 0 ? "▲" : v < 0 ? "▼" : "●";
  }

  classeVariazione(v: number): string {
    return v > 0 ? "su" : v < 0 ? "giu" : "pari";
  }

  formatNumber = formatNumber;
}
