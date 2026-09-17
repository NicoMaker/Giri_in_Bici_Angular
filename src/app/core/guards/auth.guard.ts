import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

// ============================================================
// authGuard — equivalente di
// JS/Login/autenticazione/controllo-accesso-giornaliero.js:
// senza una sessione valida per l'utente e per il giorno corrente,
// si torna al login.
// ============================================================
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.sessioneValida()) return true;
  return router.createUrlTree(["/"]);
};
