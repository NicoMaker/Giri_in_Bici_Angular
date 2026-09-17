import { Pipe, PipeTransform } from '@angular/core';
import { resolveAssetPath } from '../services/asset-path.util';

@Pipe({
  name: 'assetUrl',
  standalone: true,
})
export class AssetUrlPipe implements PipeTransform {
  transform(path: string | null | undefined): string {
    if (!path) return '';
    return resolveAssetPath(path);
  }
}
