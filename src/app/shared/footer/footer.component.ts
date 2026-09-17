import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

// ============================================================
// FooterComponent — equivalente di
// JS/assets/ui/piede-pagina/anno-corrente.js e data-odierna.js
// ============================================================
@Component({
  selector: "app-footer",
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
        padding: var(--space-7) var(--space-4) var(--space-6);
        color: var(--ink-soft);
        font-size: 0.85rem;
        border-top: 1px solid var(--border);
        margin-top: var(--space-7);
      }
      .footer p {
        margin: 0.15rem 0;
      }
      .footer__data {
        text-transform: capitalize;
      }
    `,
  ],
})
export class FooterComponent {
  annoCorrente = new Date().getFullYear();
  dataOdierna = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
