import { CommonModule, Location } from "@angular/common";
import { Component, HostListener, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MenuService } from "../../core/services/menu.service";
import { MenuItem } from "../../core/models/data.models";
import { AssetUrlPipe } from "../../core/pipes/asset-url.pipe";

// ============================================================
// NavbarComponent
//
// Equivalente di JS/Menu/voci.js + JS/layout/menu-avvio.js +
// JS/layout/menu-interruttore.js + JS/Menu/ricerca.js: legge
// json/Menu.json (invariato) e mostra il drawer di navigazione con
// ricerca sulle voci e apertura/chiusura ad hamburger.
// ============================================================
@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    AssetUrlPipe,
  ],
  template: `
    <header class="barra">
      <button
        class="menu-toggle"
        type="button"
        (click)="aperto = !aperto"
        [attr.aria-expanded]="aperto"
        aria-label="Apri il menu"
      >
        <span></span><span></span><span></span>
      </button>
      <a routerLink="/giri" class="barra__logo">
        <img [src]="'/img/logo.jpg' | assetUrl" alt="Giri in Bici" />
        <span>Giri in Bici</span>
      </a>
    </header>

    <div
      class="scrim"
      [class.scrim--visibile]="aperto"
      (click)="aperto = false"
    ></div>

    <div class="drawer" [class.drawer--aperto]="aperto">
      <div class="drawer__intestazione">
        <input
          type="search"
          placeholder="Cerca nel menu..."
          [(ngModel)]="filtro"
          name="filtroMenu"
          aria-label="Cerca nel menu"
        />
        <button
          type="button"
          (click)="aperto = false"
          aria-label="Chiudi il menu"
        >
          ✕
        </button>
      </div>

      @if (voci().length === 0) {
        <p id="menuNoResults">Nessuna voce trovata.</p>
      }

      <ul id="menuList">
        @for (item of voci(); track item.link + item.name) {
          <li>
            @if (isPaginaPrecedente(item)) {
              <a
                href="javascript:void(0)"
                class="menu-back"
                (click)="indietro()"
              >
                <span class="ico-tile"
                  ><img [src]="iconaFallback(item) | assetUrl" alt=""
                /></span>
                <span>{{ item.name }}</span>
              </a>
            } @else if (isEsterno(item)) {
              <a [href]="item.link" target="_blank" rel="noopener">
                <span class="ico-tile"
                  ><img [src]="iconaFallback(item) | assetUrl" alt=""
                /></span>
                <span>{{ item.name }}</span>
              </a>
            } @else {
              <a
                [routerLink]="rotta(item)"
                routerLinkActive="attivo"
                (click)="aperto = false"
              >
                <span class="ico-tile"
                  ><img [src]="iconaFallback(item) | assetUrl" alt=""
                /></span>
                <span>{{ item.name }}</span>
              </a>
            }
          </li>
        }
      </ul>
    </div>
  `,
  styleUrl: "./navbar.component.css",
})
export class NavbarComponent implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly location = inject(Location);

  aperto = false;
  filtro = "";
  private tutteLeVoci: MenuItem[] = [];

  async ngOnInit(): Promise<void> {
    this.tutteLeVoci = await this.menuService.getMenu();
  }

  voci(): MenuItem[] {
    const query = this.filtro.trim().toLocaleLowerCase("it");
    if (!query) return this.tutteLeVoci;
    return this.tutteLeVoci.filter((v) =>
      v.name.toLocaleLowerCase("it").includes(query),
    );
  }

  isPaginaPrecedente(item: MenuItem): boolean {
    return item.name.trim() === "Pagina Precedente" && item.link === "#";
  }

  isEsterno(item: MenuItem): boolean {
    return item.link.startsWith("http");
  }

  rotta(item: MenuItem): string[] {
    return this.menuService.toRouterLink(item.link) ?? ["/giri"];
  }

  iconaFallback(item: MenuItem): string {
    // Le icone SVG a tratto disegnate a mano dell'originale (JS/assets/icone.js)
    // non sono state riportate 1:1; si riusa sempre l'immagine di fallback
    // gia' presente in ogni voce del menu (campo "icon"), identica in tutte le pagine.
    return item.icon;
  }

  indietro(): void {
    this.aperto = false;
    this.location.back();
  }

  @HostListener("document:keydown.escape")
  chiudiConEsc(): void {
    this.aperto = false;
  }
}
