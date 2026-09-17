import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonDataService } from '../../../core/services/json-data.service';
import { StatsService } from '../../../core/services/stats.service';
import { Storico, TotaliGenerali } from '../../../core/models/data.models';
import { ItalianNumberPipe } from '../../../core/pipes/italian-number.pipe';
import { ScrollRevealDirective } from '../../../shared/scroll-reveal/scroll-reveal.directive';

// ============================================================
// StatisticheOverviewComponent — equivalente di Statistiche.html
//
// Legge json/Statistiche/History/Storico.json (invariato, unica
// fonte per anni + colori) e mostra: totali generali (StatsService,
// stesso calcolo di Giri.html), una scheda per ogni anno e i link
// alle 4 pagine "Storico" + "Stagioni".
// ============================================================
@Component({
  selector: 'app-statistiche-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, ItalianNumberPipe, ScrollRevealDirective],
  templateUrl: './statistiche-overview.component.html',
  styleUrl: './statistiche-overview.component.css',
})
export class StatisticheOverviewComponent implements OnInit {
  private readonly json = inject(JsonDataService);
  private readonly stats = inject(StatsService);

  anni: { anno: string; colore: string }[] = [];
  totali: TotaliGenerali | null = null;
  caricamento = true;

  async ngOnInit(): Promise<void> {
    const [storico, totali] = await Promise.all([
      this.json.leggiOppureNull<Storico>('json/Statistiche/History/Storico.json'),
      this.stats.getTotaliGenerali(),
    ]);

    if (storico) {
      const chiavi = Object.keys(storico.anni).sort();
      this.anni = chiavi.map((anno, i) => ({
        anno,
        colore: storico.coloriAnni[i % storico.coloriAnni.length],
      }));
    }
    this.totali = totali;
    this.caricamento = false;
  }
}
