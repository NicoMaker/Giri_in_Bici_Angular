import { Injectable } from '@angular/core';

// ============================================================
// NumberFormatService
//
// Porting 1:1 di JS/core/formattazione-numeri.js: separatore delle
// migliaia col punto, decimali con la virgola, come in tutto il
// sito originale. Le funzioni sono anche esportate come funzioni
// pure (usate dal resto dei servizi/componenti senza dover sempre
// passare dal DI di Angular).
// ============================================================

export function formatItalianNumber(
  num: number | string,
  forceDecimals = false,
): string {
  let n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';

  const rounded = Math.round((n + Number.EPSILON) * 100) / 100;

  let decimalString = '';
  if (forceDecimals || !Number.isInteger(rounded)) {
    const decimalPart = rounded.toFixed(2).split('.')[1];
    if (decimalPart !== '00') {
      decimalString = ',' + decimalPart;
    }
  }

  let integerPart = Math.trunc(Math.abs(rounded)).toString();
  const sign = rounded < 0 ? '-' : '';

  if (integerPart.length > 3) {
    const groups: string[] = [];
    let i = integerPart.length;
    while (i > 0) {
      const start = Math.max(0, i - 3);
      groups.unshift(integerPart.substring(start, i));
      i -= 3;
    }
    integerPart = groups.join('.');
  }

  return sign + integerPart + decimalString;
}

export function formatNumber(value: number | string): string {
  return formatItalianNumber(value, false);
}

export function formatPercentage(value: number | string): string {
  return formatItalianNumber(value, false);
}

export function pluralizza(
  count: number,
  singolare: string,
  plurale: string,
): string {
  return Math.abs(Number(count)) === 1 ? singolare : plurale;
}

@Injectable({ providedIn: 'root' })
export class NumberFormatService {
  formatItalianNumber = formatItalianNumber;
  formatNumber = formatNumber;
  formatPercentage = formatPercentage;
  pluralizza = pluralizza;
}
