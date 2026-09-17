import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { BackToTopComponent } from "./shared/back-to-top/back-to-top.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    BackToTopComponent,
  ],
  template: `
    <app-navbar></app-navbar>
    <main class="pagina">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-back-to-top></app-back-to-top>
  `,
  styles: [
    `
      .pagina {
        min-height: 70vh;
      }
    `,
  ],
})
export class AppComponent {}
