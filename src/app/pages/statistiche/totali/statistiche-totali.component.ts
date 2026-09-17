import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonDataService } from '../../../core/services/json-data.service';
import { ConfigMesi, Storico, YearStat } from '../../../core/models/data.models';
import { formatNumber } from '../../../core/services/number-format.service';
import { ItalianNumberPipe } from '../../../core/pipes/italian-number.pipe';
import { BarChartComponent, BarraDati } from '../../../shared/bar-chart/bar-chart.component';
import { ScrollRevealDirective } from '../../../shared/scroll-reveal/scroll-reveal.directive';

// ============================================================
// StatisticheTotaliComponent — equivalente di
// Statistiche/History/statistiche-totali.html +
// JS/Statistiche/History/statistiche-totali/nucleo/dati.js
//
// Mette in fila TUTTI i mesi di TUTTI gli anni, in ordine
// cronologico (anno, poi ordine mesi da config-mesi.json): stessa
// identica logica di GT.calculateTotals dell'originale.
// ============================================================
@Component({
  selector: 'app-statistiche-totali',
  standalone: true,
  imports: [CommonModule, RouterLink, ItalianNumberPipe, BarChartComponent, ScrollRevealDirective],
  templateUrl: './statistiche-totali.component.html',
  styleUrl: './statistiche-totali.component.css',
})
export class StatisticheTotaliComponent implements OnInit {
  private readonly json = inject(JsonDataService);

  righe: { mese: string; anno: string; km: number; percentuale: string }[] = [];
  barre: BarraDati[] = [];
  totale = 0;
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

    const ordineMesi = configMesi?.orderMesi ?? {};
    const voci = Object.entries(storico.anni);
    const datiAnni = await Promise.all(
      voci.map(async ([anno, url]) => {
        const data = await this.json.leggiOppureNull<YearStat>(url);
        if (data && !data.year) data.year = anno;
        return data;
      }),
    );

    const combinato: { mese: string; km: number; anno: string }[] = [];
    datiAnni.forEach((item) => {
      if (!item?.data) return;
      const anno = item.year || 'Sconosciuto';
      for (const mese in item.data) {
        combinato.push({ mese, km: item.data[mese], anno });
      }
    });

    combinato.sort((a, b) => {
      if (a.anno !== b.anno) return a.anno.localeCompare(b.anno);
      return (ordineMesi[a.mese] || 0) - (ordineMesi[b.mese] || 0);
    });

    const totale = combinato.reduce((acc, item) => acc + item.km, 0);

    this.righe = combinato.map((item) => ({
      mese: item.mese,
      anno: item.anno,
      km: item.km,
      percentuale: formatNumber(totale > 0 ? (item.km / totale) * 100 : 0),
    }));

    this.barre = this.righe.map((r) => ({ etichetta: `${r.mese.slice(0, 3)} ${r.anno}`, valore: r.km }));
    this.totale = totale;
    this.caricamento = false;
  }
}
