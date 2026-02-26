import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Agent, Collaborateur, Direction, Section, ServiceEntity} from '../../models/entities/entities';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HierarchieService {

  private apiUrl = `${environment.apiUrl}/collaborateurs`;

  constructor(private http: HttpClient) {}

  getResponsablesByDirection(directionId?: number): Observable<{ id: number; label: string }[]> {
    let url = `${this.apiUrl}/responsables`;
    if (directionId) {
      url += `?directionId=${directionId}`;
    }

    return this.http.get<Collaborateur[]>(url).pipe(
        map(collaborateurs => collaborateurs.map(c => ({
          id: c.id!,
          label: `${c.nom} ${c.prenoms} (${c.posteActuel || 'Collaborateur'})`
        })))
    );
  }

  getResponsablesByService(serviceId?: number): Observable<{ id: number; label: string }[]> {
    let url = `${this.apiUrl}/responsables/service`;
    if (serviceId) {
      url += `?serviceId=${serviceId}`;
    }

    return this.http.get<Collaborateur[]>(url).pipe(
        map(collaborateurs => collaborateurs.map(c => ({
          id: c.id!,
          label: `${c.nom} ${c.prenoms} (${c.posteActuel || 'Collaborateur'})`
        })))
    );
  }

  getAllResponsables(): Observable<{ id: number; label: string }[]> {
    return this.http.get<Collaborateur[]>(`${this.apiUrl}/responsables/tous`).pipe(
        map(collaborateurs => collaborateurs.map(c => ({
          id: c.id!,
          label: `${c.nom} ${c.prenoms} (${c.posteActuel || 'Collaborateur'})`
        })))
    );
  }
}
