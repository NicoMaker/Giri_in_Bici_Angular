import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatsService } from '../../core/services/stats.service';
import { TotaliGenerali } from '../../core/models/data.models';
import { ItalianNumberPipe } from '../../core/pipes/italian-number.pipe';
import { AssetUrlPipe } from '../../core/pipes/asset-url.pipe';
import { ScrollRevealDirective } from '../../shared/scroll-reveal/scroll-reveal.directive';
import { ContourDividerComponent } from '../../shared/contour-divider/contour-divider.component';
import { CountUpDirective } from '../../shared/count-up/count-up.directive';

// ============================================================
// HomeComponent — equivalente di Giri.html
// (Diario dei giri: card "km" con i totali generali + accesso
// rapido alle tre stagioni, come nella Home originale.)
// ============================================================
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ItalianNumberPipe,
    AssetUrlPipe,
    ScrollRevealDirective,
    ContourDividerComponent,
    CountUpDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly stats = inject(StatsService);

  totali: TotaliGenerali | null = null;
  medie: ReturnType<StatsService['derivaMedieGenerali']> | null = null;
  caricamento = true;

  async ngOnInit(): Promise<void> {
    this.totali = await this.stats.getTotaliGenerali();
    if (this.totali) this.medie = this.stats.derivaMedieGenerali(this.totali);
    this.caricamento = false;
  }
}
