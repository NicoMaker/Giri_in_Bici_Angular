import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { AssetUrlPipe } from "../../core/pipes/asset-url.pipe";

// ============================================================
// QrCodeComponent — equivalente di QR_CODE/Logo.html: pagina
// statica col QR code del sito (generato al volo lato client,
// nessuna dipendenza esterna necessaria).
// ============================================================
@Component({
  selector: "app-qr-code",
  standalone: true,
  imports: [CommonModule, AssetUrlPipe],
  template: `
    <section class="qr-pagina">
      <h1>Inquadra per aprire Giri in Bici</h1>
      <div class="qr-riquadro">
        <img
          [src]="qrSrc()"
          alt="QR code che punta a giri-in-bici.netlify.app"
          width="260"
          height="260"
        />
      </div>
      <p>
        <a
          href="https://giri-in-bici.netlify.app/"
          target="_blank"
          rel="noopener"
          >giri-in-bici.netlify.app</a
        >
      </p>
      <img
        class="logo"
        [src]="'/img/logo.jpg' | assetUrl"
        alt="Logo Giri in Bici"
      />
    </section>
  `,
  styles: [
    `
      .qr-pagina {
        text-align: center;
        padding: 2rem 1rem;
      }
      .qr-riquadro {
        display: inline-block;
        padding: 1rem;
        background: #fff;
        border-radius: 1rem;
        margin: 1rem 0;
      }
      .logo {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        margin-top: 1rem;
      }
    `,
  ],
})
export class QrCodeComponent {
  qrSrc(): string {
    const url = encodeURIComponent("https://giri-in-bici.netlify.app/");
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${url}`;
  }
}
