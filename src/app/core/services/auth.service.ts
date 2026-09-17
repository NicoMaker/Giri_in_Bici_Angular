import { Injectable, inject } from "@angular/core";
import { JsonDataService } from "./json-data.service";
import { UsersData } from "../models/data.models";

// ============================================================
// AuthService
//
// Porting di:
//  - JS/Login/autenticazione/caricamento-utenti.js (carica Users.json)
//  - JS/Login/autenticazione/invio-modulo.js (password del giorno,
//    formato "Giri DD/MM/YYYY")
//  - JS/Login/autenticazione/controllo-accesso-giornaliero.js
//    (sessione valida solo per il giorno corrente, sessionStorage)
// ============================================================
@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly json = inject(JsonDataService);
  private static readonly CHIAVE_UTENTE = "currentUser";
  private static readonly CHIAVE_GIORNO = "giornoAccesso";

  /** Password valida per la giornata odierna: "Giri DD/MM/YYYY". */
  generaPasswordDelGiorno(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `Giri ${day}/${month}/${year}`;
  }

  private chiaveGiornoOggi(): string {
    const oggi = new Date();
    const anno = oggi.getFullYear();
    const mese = String(oggi.getMonth() + 1).padStart(2, "0");
    const giorno = String(oggi.getDate()).padStart(2, "0");
    return `${anno}-${mese}-${giorno}`;
  }

  async tentaAccesso(username: string, password: string): Promise<boolean> {
    const dati = await this.json.leggi<UsersData>("json/About_US/Users.json");
    const utente = dati.users.find((u) => u.username === username.trim());
    const passwordAttesa = this.generaPasswordDelGiorno();

    if (utente && password.trim() === passwordAttesa) {
      sessionStorage.setItem(AuthService.CHIAVE_UTENTE, username.trim());
      sessionStorage.setItem(
        AuthService.CHIAVE_GIORNO,
        this.chiaveGiornoOggi(),
      );
      return true;
    }
    return false;
  }

  /** Equivalente della guardia-accesso.js: sessione valida solo per oggi. */
  sessioneValida(): boolean {
    const utente = sessionStorage.getItem(AuthService.CHIAVE_UTENTE);
    const giornoSalvato = sessionStorage.getItem(AuthService.CHIAVE_GIORNO);
    return !!utente && giornoSalvato === this.chiaveGiornoOggi();
  }

  esci(): void {
    sessionStorage.removeItem(AuthService.CHIAVE_UTENTE);
    sessionStorage.removeItem(AuthService.CHIAVE_GIORNO);
  }
}
