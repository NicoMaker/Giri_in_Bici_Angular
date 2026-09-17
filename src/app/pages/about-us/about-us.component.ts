import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { JsonDataService } from "../../core/services/json-data.service";
import { SiteUser, UsersData } from "../../core/models/data.models";
import { AssetUrlPipe } from "../../core/pipes/asset-url.pipe";
import { ScrollRevealDirective } from "../../shared/scroll-reveal/scroll-reveal.directive";

// ============================================================
// AboutUsComponent — equivalente di About_US/About_us.html +
// JS/About_US/users.js: legge json/About_US/Users.json (invariato)
// e mostra solo gli utenti con visibleInTeam=true, come
// nell'originale.
// ============================================================
@Component({
  selector: "app-about-us",
  standalone: true,
  imports: [CommonModule, AssetUrlPipe, ScrollRevealDirective],
  templateUrl: "./about-us.component.html",
  styleUrl: "./about-us.component.css",
})
export class AboutUsComponent implements OnInit {
  private readonly json = inject(JsonDataService);

  squadra: SiteUser[] = [];
  caricamento = true;

  async ngOnInit(): Promise<void> {
    const dati = await this.json.leggiOppureNull<UsersData>(
      "json/About_US/Users.json",
    );
    this.squadra = (dati?.users ?? []).filter((u) => u.visibleInTeam);
    this.caricamento = false;
  }

  avatarPath(u: SiteUser): string {
    return `/img/About_US/${u.avatar}`;
  }
}
