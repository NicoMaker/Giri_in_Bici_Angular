import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { JsonDataService } from "../../core/services/json-data.service";
import { StatsService } from "../../core/services/stats.service";
import { PeriodEntry, SEASONS, SeasonKey } from "../../core/models/data.models";
import { ItalianNumberPipe } from "../../core/pipes/italian-number.pipe";
import { ScrollRevealDirective } from "../../shared/scroll-reveal/scroll-reveal.directive";

// ============================================================
// SeasonYearComponent — equivalente di Primavera/2021.html,
// Estate/2021.html, Autunno_Inverno/2020-2021.html ecc.
//
// Porta 1:1 la logica di JS/calcoli/km-medi-periodo.js:
// json/<Stagione>/Periodi/<anno>.json -> tabella con percentuale
// sul totale + statistiche riassuntive.
// ============================================================
@Component({
  selector: "app-season-year",
  standalone: true,
  imports: [CommonModule, RouterLink, ItalianNumberPipe, ScrollRevealDirective],
  templateUrl: "./season-year.component.html",
  styleUrl: "./season-year.component.css",
})
export class SeasonYearComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly json = inject(JsonDataService);
  private readonly stats = inject(StatsService);
  private readonly sanitizer = inject(DomSanitizer);

  seasonKey!: SeasonKey;
  anno = "";
  righe: (PeriodEntry & {
    numero: number;
    percentuale: number;
    placeSafe: SafeHtml;
  })[] = [];
  totalKm = 0;
  totalRaces = 0;
  media = 0;
  caricamento = true;
  errore = false;

  async ngOnInit(): Promise<void> {
    this.seasonKey = this.route.snapshot.data["seasonKey"];
    this.anno = this.route.snapshot.paramMap.get("year") ?? "";
    const meta = SEASONS.find((s) => s.key === this.seasonKey)!;
    const url = `json/${meta.folder}/Periodi/${this.anno}.json`;

    const data = await this.json.leggiOppureNull<PeriodEntry[]>(url);
    if (!data || !Array.isArray(data)) {
      this.errore = true;
      this.caricamento = false;
      return;
    }

    const righeCalcolate = this.stats.righeTabellaPeriodo(data);
    this.righe = righeCalcolate.map((r) => ({
      ...r,
      placeSafe: this.sanitizer.bypassSecurityTrustHtml(r.place),
    }));

    const s = this.stats.calcolaStatistichePeriodo(data);
    this.totalKm = s.totalKm;
    this.totalRaces = s.totalRaces;
    this.media = s.media;
    this.caricamento = false;
  }
}
