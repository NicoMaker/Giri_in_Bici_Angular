import { Component, Input } from '@angular/core';

// ============================================================
// ContourDividerComponent
//
// Una piccola linea d'altimetria stilizzata, la stessa che si vede
// su un computerino da bici o su una mappa a curve di livello.
// E' la firma grafica del sito: compare una volta per pagina, come
// separatore fra l'intestazione e il contenuto, mai come
// decorazione ripetuta.
// ============================================================
@Component({
  selector: 'app-contour-divider',
  standalone: true,
  template: `
    <svg
      class="contour-divider"
      [style.color]="colore"
      viewBox="0 0 400 28"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 18 C 30 6, 55 6, 80 16 S 130 26, 160 14 S 210 4, 240 12 S 290 24, 320 14 S 370 4, 400 12"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  `,
  styles: [
    `
      .contour-divider {
        display: block;
        width: 100%;
        max-width: 260px;
        height: 20px;
        margin: 0 auto;
        opacity: 0.55;
      }
    `,
  ],
})
export class ContourDividerComponent {
  @Input() colore = 'var(--pine-500)';
}
