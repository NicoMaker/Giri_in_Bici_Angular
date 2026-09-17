import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { resolveAssetPath } from './asset-path.util';

// ============================================================
// JsonDataService — equivalente TypeScript di JS/core/lettura-json.js
//
// Nel sito originale era "l'unico posto in cui il sito legge un
// file JSON": tutte le pagine richiamavano Json.leggi(...). Qui la
// stessa idea diventa un servizio Angular iniettabile, con le
// stesse tre modalita' di lettura offerte dall'originale.
// ============================================================
@Injectable({ providedIn: 'root' })
export class JsonDataService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Promise<unknown>>();

  /** Equivalente di Json.leggi(percorso): rifiuta la promise in caso di errore. */
  leggi<T>(percorso: string): Promise<T> {
    const url = resolveAssetPath(percorso);
    if (!this.cache.has(url)) {
      this.cache.set(
        url,
        firstValueFrom(this.http.get<T>(url)).catch((errore) => {
          this.cache.delete(url);
          throw new Error(`Errore nel leggere ${url}: ${errore.message ?? errore}`);
        }),
      );
    }
    return this.cache.get(url) as Promise<T>;
  }

  /** Equivalente di Json.leggiOppureNull: logga l'errore e torna null, senza propagarlo. */
  async leggiOppureNull<T>(percorso: string): Promise<T | null> {
    try {
      return await this.leggi<T>(percorso);
    } catch (errore) {
      console.error(`Errore nel caricamento di ${percorso}:`, errore);
      return null;
    }
  }

  /** Equivalente di Json.leggiTutti: legge piu' file in parallelo. */
  leggiTutti<T>(percorsi: string[]): Promise<T[]> {
    return Promise.all(percorsi.map((p) => this.leggi<T>(p)));
  }

  /** Variante reattiva (Observable) utile nei componenti che preferiscono async pipe. */
  leggi$<T>(percorso: string): Observable<T | null> {
    const url = resolveAssetPath(percorso);
    return this.http.get<T>(url).pipe(
      catchError((errore) => {
        console.error(`Errore nel caricamento di ${percorso}:`, errore);
        return of(null);
      }),
    );
  }

  leggiTutti$<T>(percorsi: string[]): Observable<(T | null)[]> {
    if (percorsi.length === 0) return of([]);
    return forkJoin(percorsi.map((p) => this.leggi$<T>(p)));
  }
}
