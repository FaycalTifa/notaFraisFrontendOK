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

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // @ts-ignore
        if (this.authService.hasRole(requiredRoles)) {
            return true;
        }

        this.router.navigate(['/dashboard']);
        return false;
    }
}
