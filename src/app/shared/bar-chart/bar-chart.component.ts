import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ItalianNumberPipe } from "../../core/pipes/italian-number.pipe";

export interface BarraDati {
  etichetta: string;
  valore: number;
  colore?: string;
}

// ============================================================
// BarChartComponent
//
// Nell'originale ogni pagina di Statistiche disegna i propri
// grafici con Chart.js (JS/chart/chart-renderer/**). Qui, per
// restare leggeri e non dipendere dal caricamento di una libreria
// esterna, lo stesso tipo di grafico a barre e' reso con un
// componente Angular riutilizzabile in puro CSS/SVG: stessi dati,
// stessi colori (dal JSON), stesse percentuali — solo il motore di
// disegno e' diverso. chart.js resta comunque fra le dipendenze del
// progetto (package.json) per chi preferisse ripristinare i grafici
// originali.
// ============================================================
@Component({
  selector: "app-bar-chart",
  standalone: true,
  imports: [CommonModule, ItalianNumberPipe],
  template: `
    <div class="bar-chart" role="img" [attr.aria-label]="titolo">
      @if (titolo) {
        <h3 class="bar-chart__titolo">{{ titolo }}</h3>
      }
      <div class="bar-chart__corpo">
        @for (b of dati; track b.etichetta) {
          <div class="bar-chart__colonna">
            <div class="bar-chart__valore">{{ b.valore | italianNumber }}</div>
            <div
              class="bar-chart__barra"
              [style.height.%]="percentuale(b.valore)"
              [style.background]="b.colore || 'currentColor'"
            ></div>
            <div class="bar-chart__etichetta">{{ b.etichetta }}</div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .bar-chart__titolo {
        text-align: center;
        margin: 0 0 0.75rem;
      }
      .bar-chart__corpo {
        display: flex;
        align-items: flex-end;
        gap: 0.6rem;
        height: 220px;
        padding: 0 0.5rem;
        overflow-x: auto;
      }
      .bar-chart__colonna {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        flex: 1 0 44px;
        height: 100%;
      }
      .bar-chart__valore {
        font-size: 0.7rem;
        margin-bottom: 0.25rem;
        opacity: 0.8;
      }
      .bar-chart__barra {
        width: 60%;
        min-height: 2px;
        border-radius: 0.3rem 0.3rem 0 0;
        transition: height 0.4s ease;
      }
      .bar-chart__etichetta {
        margin-top: 0.4rem;
        font-size: 0.7rem;
        text-align: center;
        white-space: nowrap;
      }
    `,
  ],
})
export class BarChartComponent {
  @Input() dati: BarraDati[] = [];
  @Input() titolo = "";

  percentuale(valore: number): number {
    const max = Math.max(...this.dati.map((d) => d.valore), 1);
    return max > 0 ? (valore / max) * 100 : 0;
  }
}
