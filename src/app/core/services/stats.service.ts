import { Injectable, inject } from "@angular/core";
import { JsonDataService } from "./json-data.service";
import {
  PeriodEntry,
  Storico,
  StagioniConfig,
  TotaliGenerali,
  YearStat,
} from "../models/data.models";

// ============================================================
// StatsService
//
// Porting di JS/calcoli/km-totali.js (totali generali del sito,
// usati nella card "km" della Home) e di
// JS/calcoli/km-medi-periodo.js (statistiche di un singolo
// periodo/anno di una stagione).
// ============================================================
@Injectable({ providedIn: "root" })
export class StatsService {
  private readonly json = inject(JsonDataService);

  /** Equivalente di processHistoricalData() + contaPeriodiTotali() + stampaDati() in km-totali.js */
  async getTotaliGenerali(): Promise<TotaliGenerali | null> {
    const storico = await this.json.leggiOppureNull<Storico>(
      "json/Statistiche/History/Storico.json",
    );
    if (!storico || !storico.anni || typeof storico.anni !== "object") {
      console.error("Dati anni non trovati o non validi.");
      return null;
    }

    const yearUrls = Object.values(storico.anni);
    const risultati = await Promise.all(
      yearUrls.map(async (url) => {
        const yearData = await this.json.leggiOppureNull<YearStat>(url);
        if (!yearData || typeof yearData !== "object") {
          console.error(`Dati anno non validi per ${url}`);
          return null;
        }
        const monthEntries = Object.entries(yearData.data || {});
        const kmValues = monthEntries
          .map(([, km]) => km)
          .filter((km) => typeof km === "number" && km > 0);
        const totalKm = kmValues.reduce((sum, km) => sum + km, 0);
        const months = monthEntries.length;
        const corse =
          typeof yearData.numberOfRaces === "number"
            ? yearData.numberOfRaces
            : 0;
        return { totalKm, months, corse };
      }),
    );

    const validResults = risultati.filter(
      (r): r is { totalKm: number; months: number; corse: number } =>
        r !== null,
    );

    const totalKm = validResults.reduce((s, r) => s + r.totalKm, 0);
    const totalMonths = validResults.reduce((s, r) => s + r.months, 0);
    const totalRaces = validResults.reduce((s, r) => s + r.corse, 0);
    const totalYears = validResults.length;
    const totalPeriods = await this.contaPeriodiTotali();

    return { totalKm, totalMonths, totalRaces, totalYears, totalPeriods };
  }

  /** Equivalente di contaPeriodiTotali() in km-totali.js */
  async contaPeriodiTotali(): Promise<number> {
    const dati = await this.json.leggiOppureNull<StagioniConfig>(
      "json/Statistiche/anni/stagioni/stagioni.json",
    );
    if (!dati || !Array.isArray(dati.seasons)) return 0;
    return dati.seasons.reduce(
      (somma, stagione) =>
        somma + Object.keys(stagione.subPeriods || {}).length,
      0,
    );
  }

  /** Medie derivate, stesse formule di stampaDati() in km-totali.js */
  derivaMedieGenerali(t: TotaliGenerali) {
    return {
      avgKmPerRace: t.totalRaces > 0 ? t.totalKm / t.totalRaces : 0,
      avgKmPerMonth: t.totalMonths > 0 ? t.totalKm / t.totalMonths : null,
      avgRacesPerMonth: t.totalMonths > 0 ? t.totalRaces / t.totalMonths : null,
      avgRacesPerYear: t.totalYears > 0 ? t.totalRaces / t.totalYears : null,
      avgKmPerYear: t.totalYears > 0 ? t.totalKm / t.totalYears : null,
      avgKmPerPeriod: t.totalPeriods > 0 ? t.totalKm / t.totalPeriods : null,
      avgKmPerSeason: t.totalKm / 3,
    };
  }

  /** Equivalente di calculateAndDisplayStats() in km-medi-periodo.js, per un elenco di uscite */
  calcolaStatistichePeriodo(data: PeriodEntry[]) {
    const totalKm = data.reduce((total, row) => total + (row.distance || 0), 0);
    const totalRaces = data.length;
    const media = totalRaces > 0 ? totalKm / totalRaces : 0;
    return { totalKm, totalRaces, media };
  }

  /** Righe della tabella con percentuale sul totale, come createTableRow() in km-medi-periodo.js */
  righeTabellaPeriodo(data: PeriodEntry[]) {
    const totalKm = data.reduce((total, row) => total + (row.distance || 0), 0);
    return data.map((row, index) => ({
      ...row,
      numero: index + 1,
      percentuale: totalKm > 0 ? (row.distance / totalKm) * 100 : 0,
    }));
  }
}
