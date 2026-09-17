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
        right: var(--space-5);
        bottom: var(--space-5);
        width: 46px;
        height: 46px;
        border-radius: 50%;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--pine-700);
        cursor: pointer;
        font-size: 1.2rem;
        font-family: var(--font-display);
        z-index: 30;
        box-shadow: var(--shadow-md);
        transition: transform 0.15s ease, background 0.15s ease;
      }
      .torna-su:hover {
        background: var(--pine-700);
        color: #fff;
        transform: translateY(-2px);
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
