import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

// ============================================================
// FooterComponent — equivalente di
// JS/assets/ui/piede-pagina/anno-corrente.js e data-odierna.js
// ============================================================
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <p>© {{ annoCorrente }} Giri in Bici — Nico Maker</p>
      <p class="footer__data">{{ dataOdierna }}</p>
    </footer>
  `,
  styles: [
    `
      .footer {
        text-align: center;
        padding: 2rem 1rem;
        opacity: 0.8;
        font-size: 0.85rem;
      }
    `,
  ],
})
export class FooterComponent {
  annoCorrente = new Date().getFullYear();
  dataOdierna = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
