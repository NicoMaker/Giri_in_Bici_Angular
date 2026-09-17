// ============================================================
// data.models.ts
//
// Interfacce TypeScript che rispecchiano ESATTAMENTE la forma dei
// file JSON originali in /assets/json (copiati invariati dal
// repository sorgente). Nessun file JSON e' stato modificato: qui
// definiamo solo i tipi con cui l'app Angular li legge.
// ============================================================

export interface MenuItem {
  name: string;
  icona?: string;
  icon: string;
  link: string;
}

export interface MenuData {
  items: MenuItem[];
}

/** Una singola voce di un file "json/<Stagione>/Periodi/<anno>.json" */
export interface PeriodEntry {
  date: string;
  /** Contiene markup HTML (link <a> verso Komoot) cosi' come nel sito originale */
  place: string;
  distance: number;
}

/** json/<Stagione>/<stagione>.json (es. json/Primavera/primavera.json) */
export interface SeasonConfig {
  season: string;
  image: string;
  path: string;
  cssclass: string;
  subPeriods: Record<string, string>;
  colors: string[];
}

/** json/Statistiche/anni/<anno>.json */
export interface YearStat {
  year: string;
  numberOfRaces: number;
  data: Record<string, number>;
  _notaColori?: string;
}

/** json/Statistiche/History/Storico.json */
export interface Storico {
  _nota?: string;
  anni: Record<string, string>;
  coloriAnni: string[];
}

/** json/Statistiche/History/config-mesi.json */
export interface ConfigMesi {
  orderMesi: Record<string, number>;
  coloriMesi: Record<string, string>;
  _notaColoriMesi?: string;
}

/** json/Statistiche/anni/stagioni/stagioni.json */
export interface StagioniConfig {
  seasons: {
    name: string;
    displayName: string;
    link: string;
    subPeriods: Record<string, string>;
  }[];
}

/** json/Statistiche/anni/stagioni/seasons-config.json */
export interface SeasonsUiConfig {
  [key: string]: unknown;
}

/** json/Bici/bici.json */
export interface Bike {
  nome: string;
  tipo: string;
  tipo_freni: string;
  materiale: string;
  misura_ruote: number;
  avanti: number;
  dietro: number;
  anno: number;
  immagine: string;
}

export interface BiciData {
  intestazioni: {
    home: string;
    mtb: string[];
    corsa: string[];
  };
  bici: Bike[];
}

/** json/About_US/Users.json */
export interface SiteUser {
  name?: string;
  username: string;
  description?: string;
  avatar?: string;
  komootUrl?: string;
  visibleInTeam: boolean;
}

export interface UsersData {
  users: SiteUser[];
}

/** Le tre "famiglie" di stagione gestite dal sito */
export type SeasonKey = 'primavera' | 'estate' | 'autunno-inverno';

export interface SeasonRouteConfig {
  key: SeasonKey;
  label: string;
  configPath: string;
  /** cartella reale sotto assets/json/ usata nei subPeriods, es. "Primavera" */
  folder: string;
}

export const SEASONS: SeasonRouteConfig[] = [
  {
    key: 'primavera',
    label: 'Primavera',
    configPath: 'json/Primavera/primavera.json',
    folder: 'Primavera',
  },
  {
    key: 'estate',
    label: 'Estate',
    configPath: 'json/Estate/estate.json',
    folder: 'Estate',
  },
  {
    key: 'autunno-inverno',
    label: 'Autunno - Inverno',
    configPath: 'json/Autunno_Inverno/autunno-inverno.json',
    folder: 'Autunno_Inverno',
  },
];

/** Aggregato calcolato da StatsService, equivalente di km-totali.js */
export interface TotaliGenerali {
  totalKm: number;
  totalMonths: number;
  totalRaces: number;
  totalYears: number;
  totalPeriods: number;
}

/** Un risultato di ricerca nel diario (cerca per data / per posto) */
export interface RisultatoRicerca {
  data: string;
  posto: string;
  distanza: number;
  stagione: string;
  periodo: string;
  /** timestamp approssimativo per l'ordinamento cronologico */
  ordinamento: number;
}
