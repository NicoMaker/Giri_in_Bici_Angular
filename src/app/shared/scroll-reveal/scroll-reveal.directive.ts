import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
} from "@angular/core";

// ============================================================
// ScrollRevealDirective — equivalente di
// JS/assets/ui/effetti-scroll/comparsa-al-scroll.js
//
// Aggiunge la classe "in-vista" quando l'elemento entra nel
// viewport, cosi' le animazioni CSS gia' presenti in
// assets/componenti/animazioni/... (invariate) possono agganciarsi.
// ============================================================
@Directive({
  selector: "[appScrollReveal]",
  standalone: true,
})
export class ScrollRevealDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.el.nativeElement.classList.add("comparsa-scroll");
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.el.nativeElement.classList.add("in-vista");
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      },
      { threshold: 0.15 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
