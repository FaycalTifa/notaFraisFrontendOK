import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrlPipe'
})
export class SafeUrlPipePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustUrl('');

    try {
      // Nettoyer l'URL des caractères problématiques
      let cleanUrl = url.trim();

      // Vérifier que c'est une data URL valide
      if (cleanUrl.startsWith('data:image')) {
        return this.sanitizer.bypassSecurityTrustUrl(cleanUrl);
      }

      console.warn('URL non valide:', cleanUrl.substring(0, 50));
      return this.sanitizer.bypassSecurityTrustUrl('');
    } catch (error) {
      console.error('Erreur sanitization:', error);
      return this.sanitizer.bypassSecurityTrustUrl('');
    }
  }
}
