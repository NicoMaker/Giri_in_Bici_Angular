import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

// ============================================================
// BackToTopComponent — equivalente di
// JS/assets/motion/barre/torna-su.js
// ============================================================
@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visibile) {
      <button class="torna-su" type="button" (click)="tornaSu()" aria-label="Torna su">
        ↑
      </button>
    }
  `,
  styles: [
    `
      .torna-su {
        position: fixed;
        right: 1.25rem;
        bottom: 1.25rem;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        z-index: 30;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      }
    `,
  ],
})
export class BackToTopComponent {
  visibile = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.visibile = window.scrollY > 400;
  }

  tornaSu(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
