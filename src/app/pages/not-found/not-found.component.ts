import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="non-trovato">
      <h1>404</h1>
      <p>Pagina non trovata.</p>
      <a routerLink="/giri">Torna alla Home</a>
    </section>
  `,
  styles: [
    `
      .non-trovato {
        text-align: center;
        padding: 4rem 1rem;
      }
    `,
  ],
})
export class NotFoundComponent {}
