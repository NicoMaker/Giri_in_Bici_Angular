import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonDataService } from '../../../core/services/json-data.service';
import { ConfigMesi, Storico, YearStat } from '../../../core/models/data.models';
import { formatItalianNumber, formatNumber } from '../../../core/services/number-format.service';
import { ItalianNumberPipe } from '../../../core/pipes/italian-number.pipe';
import { BarChartComponent, BarraDati } from '../../../shared/bar-chart/bar-chart.component';
import { ScrollRevealDirective } from '../../../shared/scroll-reveal/scroll-reveal.directive';

// ============================================================
// StatisticheMensiliComponent — equivalente di
// Statistiche/History/statistiche-mensili.html +
// JS/Statistiche/History/statistiche-mensili/**
//
// Somma, per ognuno dei 12 mesi, i km fatti in QUEL mese in tutti
// gli anni disponibili (json/Statistiche/anni/*.json elencati in
// Storico.json), esattamente come il controller originale.
// ============================================================
@Component({
  selector: 'app-statistiche-mensili',
  standalone: true,
  imports: [CommonModule, RouterLink, ItalianNumberPipe, BarChartComponent, ScrollRevealDirective],
  templateUrl: './statistiche-mensili.component.html',
  styleUrl: './statistiche-mensili.component.css',
})
export class StatisticheMensiliComponent implements OnInit {
  private readonly json = inject(JsonDataService);

  righe: { mese: string; km: number; percentuale: string; mesiPercorsi: number; kmMedioMese: string; colore: string }[] = [];
  barre: BarraDati[] = [];
  totaleChilometri = 0;
  mediaComplessiva = '0';
  totaleCorse = 0;
  mediaCorse = '0';
  caricamento = true;

  async ngOnInit(): Promise<void> {
    const [storico, configMesi] = await Promise.all([
      this.json.leggiOppureNull<Storico>('json/Statistiche/History/Storico.json'),
      this.json.leggiOppureNull<ConfigMesi>('json/Statistiche/History/config-mesi.json'),
    ]);

    if (!storico) {
      this.caricamento = false;
      return;
    }

    const elencoMesi = configMesi
      ? Object.keys(configMesi.orderMesi).sort(
          (a, b) => configMesi.orderMesi[a] - configMesi.orderMesi[b],
        )
      : ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const coloriMesi = configMesi?.coloriMesi ?? {};

    const allData = await this.json.leggiTutti<YearStat>(Object.values(storico.anni));

    const chilometriTotali = new Array(elencoMesi.length).fill(0);
    const mesiPercorsi = new Array(elencoMesi.length).fill(0);

    allData.forEach((jsonAnno) => {
      elencoMesi.forEach((mese, index) => {
        if (jsonAnno?.data?.[mese]) {
          chilometriTotali[index] += jsonAnno.data[mese];
          mesiPercorsi[index] += 1;
        }
      });
    });

    const totaleChilometri = chilometriTotali.reduce((a, b) => a + b, 0);
    const totaleCorse = allData.reduce((total, json) => total + (json?.numberOfRaces || 0), 0);

    this.righe = elencoMesi.map((mese, i) => ({
      mese,
      km: chilometriTotali[i],
      percentuale: formatNumber(totaleChilometri > 0 ? (chilometriTotali[i] / totaleChilometri) * 100 : 0),
      mesiPercorsi: mesiPercorsi[i],
      kmMedioMese: mesiPercorsi[i] > 0 ? formatItalianNumber(chilometriTotali[i] / mesiPercorsi[i], true) : '0,00',
      colore: coloriMesi[mese] || 'blue',
    }));

    this.barre = this.righe.map((r) => ({ etichetta: r.mese, valore: r.km, colore: r.colore }));

    this.totaleChilometri = totaleChilometri;
    this.mediaComplessiva = formatNumber(totaleChilometri / 12);
    this.totaleCorse = totaleCorse;
    this.mediaCorse = formatNumber(totaleCorse / 12);
    this.caricamento = false;
  }
}
