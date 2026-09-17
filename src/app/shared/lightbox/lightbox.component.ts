import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

// ============================================================
// LightboxComponent — equivalente di
// JS/assets/ui/effetti-scroll/lightbox-foto.js
//
// Servizio + componente minimale per aprire una foto a schermo
// intero, riusato da tutte le pagine con gallerie (About_US, Bici,
// Statistiche/Anni, ecc.).
// ============================================================
@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (src) {
      <div class="lightbox" (click)="chiudi()">
        <button class="lightbox__chiudi" type="button" (click)="chiudi()" aria-label="Chiudi">✕</button>
        <img [src]="src" [alt]="alt" (click)="$event.stopPropagation()" />
      </div>
    }
  `,
  styles: [
    `
      .lightbox {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        cursor: zoom-out;
      }
      .lightbox img {
        max-width: 92vw;
        max-height: 92vh;
        border-radius: 0.5rem;
      }
      .lightbox__chiudi {
        position: absolute;
        top: 1rem;
        right: 1.25rem;
        background: transparent;
        border: none;
        color: #fff;
        font-size: 1.5rem;
        cursor: pointer;
      }
    `,
  ],
})
export class LightboxComponent {
  src: string | null = null;
  alt = '';

  apri(src: string, alt = ''): void {
    this.src = src;
    this.alt = alt;
  }

  chiudi(): void {
    this.src = null;
  }
}
