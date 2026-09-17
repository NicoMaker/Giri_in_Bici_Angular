import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JsonDataService } from '../../../core/services/json-data.service';
import { ConfigMesi, YearStat } from '../../../core/models/data.models';
import { formatNumber } from '../../../core/services/number-format.service';
import { ItalianNumberPipe } from '../../../core/pipes/italian-number.pipe';
import { BarChartComponent, BarraDati } from '../../../shared/bar-chart/bar-chart.component';
import { ScrollRevealDirective } from '../../../shared/scroll-reveal/scroll-reveal.directive';

// ============================================================
// StatisticheAnnoComponent — equivalente di
// Statistiche/Anni/<anno>.html + JS/Statistiche/anni/nucleo/*.js
//
// Legge json/Statistiche/anni/<anno>.json (invariato) + i colori
// dei mesi da json/Statistiche/History/config-mesi.json, esattamente
// come il controller originale: il colore di ogni mese viene sempre
// dalla mappa coloriMesi, mai da un array a posizione fissa.
// ============================================================
@Component({
  selector: 'app-statistiche-anno',
  standalone: true,
  imports: [CommonModule, RouterLink, ItalianNumberPipe, BarChartComponent, ScrollRevealDirective],
  templateUrl: './statistiche-anno.component.html',
  styleUrl: './statistiche-anno.component.css',
})
export class StatisticheAnnoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly json = inject(JsonDataService);

  anno = '';
  righe: { mese: string; km: number; percentuale: string; colore: string }[] = [];
  barre: BarraDati[] = [];
  totale = 0;
  corse = 0;
  kmMediPerCorsa = '0';
  kmMediPerMese = '0';
  caricamento = true;
  errore = false;

  async ngOnInit(): Promise<void> {
    this.anno = this.route.snapshot.paramMap.get('year') ?? '';

    const [jsonData, configMesi] = await Promise.all([
      this.json.leggiOppureNull<YearStat>(`json/Statistiche/anni/${this.anno}.json`),
      this.json.leggiOppureNull<ConfigMesi>('json/Statistiche/History/config-mesi.json'),
    ]);

    if (!jsonData) {
      this.errore = true;
      this.caricamento = false;
      return;
    }

    const coloriMesi = configMesi?.coloriMesi ?? {};
    const mesi = Object.keys(jsonData.data);
    const chilometri = Object.values(jsonData.data);
    const totale = chilometri.reduce((acc, cur) => acc + cur, 0);
    const corse = jsonData.numberOfRaces;

    this.totale = totale;
    this.corse = corse;
    this.kmMediPerCorsa = formatNumber(corse > 0 ? totale / corse : 0);
    this.kmMediPerMese = formatNumber(mesi.length > 0 ? totale / mesi.length : 0);

    this.righe = mesi.map((mese, i) => ({
      mese,
      km: chilometri[i],
      percentuale: formatNumber(totale > 0 ? (chilometri[i] / totale) * 100 : 0),
      colore: coloriMesi[mese] || 'blue',
    }));

    this.barre = this.righe.map((r) => ({ etichetta: r.mese, valore: r.km, colore: r.colore }));
    this.caricamento = false;
  }
}
