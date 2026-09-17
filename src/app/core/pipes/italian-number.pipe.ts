import { Pipe, PipeTransform } from '@angular/core';
import { formatItalianNumber } from '../services/number-format.service';

@Pipe({
  name: 'italianNumber',
  standalone: true,
})
export class ItalianNumberPipe implements PipeTransform {
  transform(value: number | string | null | undefined, forceDecimals = false): string {
    if (value === null || value === undefined) return '0';
    return formatItalianNumber(value, forceDecimals);
  }
}
