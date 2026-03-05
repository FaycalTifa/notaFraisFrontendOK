import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { Role } from '../../models/enum/role';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardsGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const requiredRoles = route.data['roles'] as string[];

        // Si aucune rôle requis, accès autorisé
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // Vérifier si l'utilisateur a au moins un des rôles requis
        if (this.authService.hasAnyRole(requiredRoles)) {
            return true;
        }

        // Rediriger vers le dashboard si pas les droits
        this.router.navigate(['/dashboard']);
        return false;
    }
}
