import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// ============================================================
// app.routes.ts
//
// Ogni vecchia pagina .html del sito diventa qui una rotta Angular.
// Le pagine per singolo anno/periodo (Primavera/2021.html,
// Statistiche/Anni/2021.html, ecc.) diventano UNA rotta con
// parametro (:year), invece di 40 file quasi identici — stessa
// resa, meno duplicazione, ed e' cosi' che si aggiungono nuovi anni
// in Angular: nessun nuovo file da creare, basta il JSON.
// ============================================================
export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
  { path: 'giri', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) , canActivate: [authGuard] },

  { path: 'primavera', loadComponent: () => import('./pages/season/season.component').then((m) => m.SeasonComponent), data: { seasonKey: 'primavera' } , canActivate: [authGuard] },
  { path: 'primavera/:year', loadComponent: () => import('./pages/season-year/season-year.component').then((m) => m.SeasonYearComponent), data: { seasonKey: 'primavera' } , canActivate: [authGuard] },

  { path: 'estate', loadComponent: () => import('./pages/season/season.component').then((m) => m.SeasonComponent), data: { seasonKey: 'estate' } , canActivate: [authGuard] },
  { path: 'estate/:year', loadComponent: () => import('./pages/season-year/season-year.component').then((m) => m.SeasonYearComponent), data: { seasonKey: 'estate' } , canActivate: [authGuard] },

  { path: 'autunno-inverno', loadComponent: () => import('./pages/season/season.component').then((m) => m.SeasonComponent), data: { seasonKey: 'autunno-inverno' } , canActivate: [authGuard] },
  { path: 'autunno-inverno/:year', loadComponent: () => import('./pages/season-year/season-year.component').then((m) => m.SeasonYearComponent), data: { seasonKey: 'autunno-inverno' } , canActivate: [authGuard] },

  { path: 'bici', loadComponent: () => import('./pages/bici/bici.component').then((m) => m.BiciComponent) , canActivate: [authGuard] },
  { path: 'about-us', loadComponent: () => import('./pages/about-us/about-us.component').then((m) => m.AboutUsComponent) , canActivate: [authGuard] },
  { path: 'cerca-data', loadComponent: () => import('./pages/cerca-data/cerca-data.component').then((m) => m.CercaDataComponent) , canActivate: [authGuard] },
  { path: 'qr-code', loadComponent: () => import('./pages/qr-code/qr-code.component').then((m) => m.QrCodeComponent) , canActivate: [authGuard] },

  { path: 'statistiche', loadComponent: () => import('./pages/statistiche/overview/statistiche-overview.component').then((m) => m.StatisticheOverviewComponent) , canActivate: [authGuard] },
  { path: 'statistiche/anni/:year', loadComponent: () => import('./pages/statistiche/anno/statistiche-anno.component').then((m) => m.StatisticheAnnoComponent) , canActivate: [authGuard] },
  { path: 'statistiche/stagioni', loadComponent: () => import('./pages/statistiche/stagioni/statistiche-stagioni.component').then((m) => m.StatisticheStagioniComponent) , canActivate: [authGuard] },
  { path: 'statistiche/storico/classifica-mesi', loadComponent: () => import('./pages/statistiche/classifica-mesi/classifica-mesi.component').then((m) => m.ClassificaMesiComponent) , canActivate: [authGuard] },
  { path: 'statistiche/storico/mensili', loadComponent: () => import('./pages/statistiche/mensili/statistiche-mensili.component').then((m) => m.StatisticheMensiliComponent) , canActivate: [authGuard] },
  { path: 'statistiche/storico/totali', loadComponent: () => import('./pages/statistiche/totali/statistiche-totali.component').then((m) => m.StatisticheTotaliComponent) , canActivate: [authGuard] },
  { path: 'statistiche/storico/storico-mensile', loadComponent: () => import('./pages/statistiche/storico-mensile/storico-mensile.component').then((m) => m.StoricoMensileComponent) , canActivate: [authGuard] },

  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent) },
];
