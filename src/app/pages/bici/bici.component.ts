import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { JsonDataService } from "../../core/services/json-data.service";
import { BiciData, Bike } from "../../core/models/data.models";
import { AssetUrlPipe } from "../../core/pipes/asset-url.pipe";
import { ScrollRevealDirective } from "../../shared/scroll-reveal/scroll-reveal.directive";

type Filtro = "home" | "mtb" | "corsa" | "tutte";

// ============================================================
// BiciComponent — equivalente di Bici/Bici.html +
// JS/Bici/nucleo/controller.js + filtri.js + visualizzazione/*.js
//
// Legge json/Bici/bici.json (invariato): all'avvio mostra
// l'intestazione "home" (come nell'originale), poi i pulsanti
// filtro cambiano la vista fra MTB, Corsa e Tutte.
// ============================================================
@Component({
  selector: "app-bici",
  standalone: true,
  imports: [CommonModule, AssetUrlPipe, ScrollRevealDirective],
  templateUrl: "./bici.component.html",
  styleUrl: "./bici.component.css",
})
export class BiciComponent implements OnInit {
  private readonly json = inject(JsonDataService);

  dati: BiciData | null = null;
  filtro: Filtro = "home";
  caricamento = true;

  async ngOnInit(): Promise<void> {
    this.dati = await this.json.leggiOppureNull<BiciData>(
      "json/Bici/bici.json",
    );
    this.caricamento = false;
  }

  imposta(f: Filtro): void {
    this.filtro = f;
  }

  biciFiltrate(): Bike[] {
    if (!this.dati) return [];
    if (this.filtro === "tutte" || this.filtro === "home")
      return this.dati.bici;
    return this.dati.bici.filter((b) => b.tipo === this.filtro);
  }

  immaginiIntestazione(): string[] {
    if (!this.dati) return [];
    if (this.filtro === "mtb") return this.dati.intestazioni.mtb;
    if (this.filtro === "corsa") return this.dati.intestazioni.corsa;
    return [this.dati.intestazioni.home];
  }
}
