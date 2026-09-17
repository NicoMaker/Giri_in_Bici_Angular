import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonDataService } from '../../../core/services/json-data.service';
import { PeriodEntry, StagioniConfig } from '../../../core/models/data.models';
import { formatNumber } from '../../../core/services/number-format.service';
import { ItalianNumberPipe } from '../../../core/pipes/italian-number.pipe';
import { BarChartComponent, BarraDati } from '../../../shared/bar-chart/bar-chart.component';
import { ScrollRevealDirective } from '../../../shared/scroll-reveal/scroll-reveal.directive';

// ============================================================
// StatisticheStagioniComponent — equivalente di
// Statistiche/stagioni.html + JS/Statistiche/stagioni/nucleo/dati.js
//
// Legge json/Statistiche/anni/stagioni/stagioni.json (invariato),
// poi per ogni stagione TUTTI i file di json/<Stagione>/Periodi/*
// elencati nei suoi subPeriods, li somma (S.sumData) e conta le
// uscite (S.countRaces): stessa identica logica dell'originale.
// ============================================================
@Component({
  selector: 'app-statistiche-stagioni',
  standalone: true,
  imports: [CommonModule, RouterLink, ItalianNumberPipe, BarChartComponent, ScrollRevealDirective],
  templateUrl: './statistiche-stagioni.component.html',
  styleUrl: './statistiche-stagioni.component.css',
})
export class StatisticheStagioniComponent implements OnInit {
  private readonly json = inject(JsonDataService);

  caricamento = true;
  errore = false;

  schede: {
    nome: string;
    km: number;
    corse: number;
    percentuale: string;
    periodi: number;
    kmMedioPeriodo: string;
  }[] = [];

  barre: BarraDati[] = [];
  totale = 0;
  totalePeriodi = 0;
  corseTotale = 0;
  avgMediaStagione = '0';
  avgPeriod = '0';

  private readonly coloriStagione: Record<string, string> = {
    Primavera: '#f472b6',
    Estate: '#f59e0b',
    Autunno_Inverno: '#3b82f6',
  };

  async ngOnInit(): Promise<void> {
    const seasonsData = await this.json.leggiOppureNull<StagioniConfig>(
      'json/Statistiche/anni/stagioni/stagioni.json',
    );

    if (!seasonsData || !Array.isArray(seasonsData.seasons)) {
      this.errore = true;
      this.caricamento = false;
      return;
    }

    const risolte = await Promise.all(
      seasonsData.seasons.map(async (season) => {
        const percorsi = Object.values(season.subPeriods);
        const datiPeriodi = await Promise.all(
          percorsi.map((p) => this.json.leggiOppureNull<PeriodEntry[]>(p)),
        );
        const flat = datiPeriodi.filter((d): d is PeriodEntry[] => Array.isArray(d)).flat();
        return {
          name: season.name,
          displayName: season.displayName,
          data: flat,
          numPeriodi: percorsi.length,
        };
      }),
    );

    const somma = (arr: PeriodEntry[]) => arr.reduce((s, r) => s + (r.distance || 0), 0);

    const totale = risolte.reduce((s, r) => s + somma(r.data), 0);
    const corseTotale = risolte.reduce((s, r) => s + r.data.length, 0);
    const totalePeriodi = risolte.reduce((s, r) => s + r.numPeriodi, 0);

    this.schede = risolte.map((r) => {
      const km = somma(r.data);
      return {
        nome: r.displayName,
        km,
        corse: r.data.length,
        percentuale: formatNumber(totale > 0 ? (km / totale) * 100 : 0),
        periodi: r.numPeriodi,
        kmMedioPeriodo: formatNumber(r.numPeriodi > 0 ? km / r.numPeriodi : 0),
      };
    });

    this.barre = risolte.map((r) => ({
      etichetta: r.displayName,
      valore: somma(r.data),
      colore: this.coloriStagione[r.name] ?? undefined,
    }));

    this.totale = totale;
    this.corseTotale = corseTotale;
    this.totalePeriodi = totalePeriodi;
    this.avgMediaStagione = formatNumber(totale / 3);
    this.avgPeriod = formatNumber(totalePeriodi > 0 ? totale / totalePeriodi : 0);
    this.caricamento = false;
  }
}
