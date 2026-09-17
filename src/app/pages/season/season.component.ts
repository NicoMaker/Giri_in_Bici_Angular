import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { JsonDataService } from "../../core/services/json-data.service";
import {
  SEASONS,
  SeasonConfig,
  SeasonKey,
} from "../../core/models/data.models";
import { AssetUrlPipe } from "../../core/pipes/asset-url.pipe";
import { ScrollRevealDirective } from "../../shared/scroll-reveal/scroll-reveal.directive";

// ============================================================
// SeasonComponent — equivalente di Primavera.html / Estate.html /
// Autunno_Inverno.html: legge json/<Stagione>/<stagione>.json
// (invariato) e mostra una scheda per ogni anno/periodo disponibile
// in subPeriods, coi colori dichiarati nel file stesso.
// ============================================================
@Component({
  selector: "app-season",
  standalone: true,
  imports: [CommonModule, RouterLink, AssetUrlPipe, ScrollRevealDirective],
  templateUrl: "./season.component.html",
  styleUrl: "./season.component.css",
})
export class SeasonComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly json = inject(JsonDataService);

  seasonKey!: SeasonKey;
  config: SeasonConfig | null = null;
  anni: { anno: string; colore: string }[] = [];
  caricamento = true;

  async ngOnInit(): Promise<void> {
    this.seasonKey = this.route.snapshot.data["seasonKey"];
    const meta = SEASONS.find((s) => s.key === this.seasonKey)!;
    this.config = await this.json.leggiOppureNull<SeasonConfig>(
      meta.configPath,
    );

    if (this.config) {
      const chiavi = Object.keys(this.config.subPeriods);
      this.anni = chiavi.map((anno, i) => ({
        anno,
        colore: this.config!.colors[i % this.config!.colors.length],
      }));
    }
    this.caricamento = false;
  }

  immagineIntestazione(): string {
    if (!this.config) return "";
    // Nei json originali "image" e' un nome file relativo a img/<Stagione>.jpg
    return `/img/${this.config.path}.jpg`;
  }
}
