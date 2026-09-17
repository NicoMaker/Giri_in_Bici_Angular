import { Injectable, inject } from '@angular/core';
import { JsonDataService } from './json-data.service';
import { MenuData, MenuItem } from '../models/data.models';

// ============================================================
// MenuService — equivalente di JS/Menu/voci.js
// Legge json/Menu.json (invariato) e mappa ogni voce sulla rotta
// Angular corrispondente al vecchio link .html.
// ============================================================
@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly json = inject(JsonDataService);

  async getMenu(): Promise<MenuItem[]> {
    const data = await this.json.leggiOppureNull<MenuData>('json/Menu.json');
    return data?.items ?? [];
  }

  /** Traduce un vecchio link .html del sito statico nella rotta Angular equivalente. */
  toRouterLink(link: string): string[] | null {
    const map: Record<string, string[]> = {
      'Giri.html': ['/giri'],
      'Statistiche.html': ['/statistiche'],
      'CercaData.html': ['/cerca-data'],
      'Bici/Bici.html': ['/bici'],
      'Primavera.html': ['/primavera'],
      'Estate.html': ['/estate'],
      'Autunno_Inverno.html': ['/autunno-inverno'],
      'index.html': ['/'],
      'About_US/About_us.html': ['/about-us'],
      'QR_CODE/Logo.html': ['/qr-code'],
      'Statistiche/stagioni.html': ['/statistiche/stagioni'],
    };
    return map[link] ?? null;
  }
}
