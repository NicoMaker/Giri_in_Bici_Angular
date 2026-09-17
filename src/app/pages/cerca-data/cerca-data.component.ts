import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import {
  CriterioOrdine,
  SearchService,
  Uscita,
} from "../../core/services/search.service";
import { ItalianNumberPipe } from "../../core/pipes/italian-number.pipe";

// ============================================================
// CercaDataComponent — equivalente di CercaData.html +
// JS/assets/ui/ricerca-diario/{dati-condivisi,cerca-per-data,
// cerca-per-posto}.js
//
// Due modalita' nella stessa pagina, come nell'originale:
//  - Cerca per data: una o piu' date (+ posti opzionali)
//  - Cerca per posto: sottostringa cercata in tutto il diario
// Stesso ordinamento a 6 criteri, stessa individuazione dell'anno
// "vero" per le uscite Autunno-Inverno.
// ============================================================
@Component({
  selector: "app-cerca-data",
  standalone: true,
  imports: [CommonModule, FormsModule, ItalianNumberPipe],
  templateUrl: "./cerca-data.component.html",
  styleUrl: "./cerca-data.component.css",
})
export class CercaDataComponent {
  private readonly search = inject(SearchService);
  private readonly sanitizer = inject(DomSanitizer);

  modalita: "data" | "posto" = "data";

  // --- Cerca per data ---
  date: string[] = [""];
  postiPerData: string[] = [""];

  // --- Cerca per posto ---
  testoPosto = "";

  criterio: CriterioOrdine = "alfabetico";
  risultati: (Uscita & { postoSafe: SafeHtml })[] = [];
  cercato = false;
  inCorso = false;

  aggiungiData(): void {
    this.date.push("");
  }

  rimuoviData(i: number): void {
    this.date.splice(i, 1);
  }

  aggiungiPosto(): void {
    this.postiPerData.push("");
  }

  rimuoviPosto(i: number): void {
    this.postiPerData.splice(i, 1);
  }

  async cercaPerData(): Promise<void> {
    const dateValide = this.date
      .filter(Boolean)
      .map((d) => new Date(d + "T00:00:00"));
    if (dateValide.length === 0) return;
    this.inCorso = true;
    this.cercato = true;
    const posti = this.postiPerData.filter((p) => p.trim());
    const uscite = await this.search.cercaPerDate(dateValide, posti);
    this.applicaRisultati(uscite);
    this.inCorso = false;
  }

  async cercaPerPosto(): Promise<void> {
    if (!this.testoPosto.trim()) return;
    this.inCorso = true;
    this.cercato = true;
    const uscite = await this.search.cercaPerPosto(this.testoPosto);
    this.applicaRisultati(uscite);
    this.inCorso = false;
  }

  cambiaCriterio(c: CriterioOrdine): void {
    this.criterio = c;
    const base = this.risultati.map(({ postoSafe, ...u }) => u);
    this.applicaRisultati(base);
  }

  private applicaRisultati(uscite: Uscita[]): void {
    const ordinati = this.search.ordina(uscite, this.criterio);
    this.risultati = ordinati.map((u) => ({
      ...u,
      postoSafe: this.sanitizer.bypassSecurityTrustHtml(u.postoHtml),
    }));
  }

  totaleKm(): number {
    return this.risultati.reduce((s, u) => s + u.distanza, 0);
  }
}
