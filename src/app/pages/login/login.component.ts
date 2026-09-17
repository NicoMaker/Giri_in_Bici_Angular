import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { AssetUrlPipe } from "../../core/pipes/asset-url.pipe";

// ============================================================
// LoginComponent — equivalente di index.html + JS/Login/**
// ============================================================
@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, AssetUrlPipe],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = "";
  password = "";
  mostraPassword = false;
  inCorso = false;
  messaggio: { testo: string; tipo: "success" | "error" | "warning" } | null =
    null;
  cookieAccettati = false;
  scuoti = false;

  async accedi(): Promise<void> {
    if (!this.cookieAccettati) {
      this.messaggio = {
        testo: "⚠️ Devi accettare i cookie per accedere!",
        tipo: "warning",
      };
      return;
    }
    this.inCorso = true;
    this.messaggio = null;

    try {
      // Piccolo ritardo, come nell'originale, per dare un feedback visivo dello spinner
      const [ok] = await Promise.all([
        this.auth.tentaAccesso(this.username, this.password),
        new Promise((r) => setTimeout(r, 500)),
      ]);

      if (ok) {
        this.messaggio = {
          testo: "✅ Accesso riuscito! Reindirizzamento...",
          tipo: "success",
        };
        await this.router.navigate(["/giri"]);
      } else {
        this.messaggio = {
          testo: "❌ Nome utente o password non validi!",
          tipo: "error",
        };
        this.scuoti = true;
        setTimeout(() => (this.scuoti = false), 500);
      }
    } catch (e) {
      console.error("Errore durante l'accesso:", e);
      this.messaggio = {
        testo: "❌ Errore durante l'accesso. Riprova più tardi.",
        tipo: "error",
      };
    } finally {
      this.inCorso = false;
    }
  }

  accettaCookie(): void {
    this.cookieAccettati = true;
  }
}
