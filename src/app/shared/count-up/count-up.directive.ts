import { Directive, ElementRef, Input, OnChanges, inject } from '@angular/core';
import { formatItalianNumber } from '../../core/services/number-format.service';

// ============================================================
// CountUpDirective
//
// L'unico momento di motion "orchestrato" del sito: il grande
// numero dei km totali in Home conta da 0 al valore reale al primo
// caricamento. Tutto il resto (hover, apertura menu) resta
// motion legata all'azione della persona, non decorativa.
// ============================================================
@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements OnChanges {
  private readonly el = inject(ElementRef<HTMLElement>);
  private animato = false;

  @Input('appCountUp') valore: number | null = null;

  ngOnChanges(): void {
    if (this.animato || this.valore === null || this.valore === undefined) return;
    this.animato = true;

    const target = this.valore;
    const durata = 1100;
    const inizio = performance.now();

    const passo = (adesso: number) => {
      const t = Math.min(1, (adesso - inizio) / durata);
      const eased = 1 - Math.pow(1 - t, 3);
      this.el.nativeElement.textContent = formatItalianNumber(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(passo);
    };

    requestAnimationFrame(passo);
  }
}
