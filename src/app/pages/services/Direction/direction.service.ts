import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Direction, DirectionResponse} from '../../models/entities/entities';
import {tap} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
export type EntityResponseType = HttpResponse<Direction>;
export type EntityArrayResponseType = HttpResponse<Direction[]>;

@Injectable({
  providedIn: 'root'
})
export class DirectionService {

    private apiUrl = `${environment.apiUrl}/direction`;

    constructor(private http: HttpClient) {}

    getAllDirections(): Observable<DirectionResponse[]> {
        return this.http.get<DirectionResponse[]>(this.apiUrl);
    }

    getDirectionById(id: number): Observable<DirectionResponse> {
        return this.http.get<DirectionResponse>(`${this.apiUrl}/${id}`);
    }

    getDirectionByCode(code: string): Observable<DirectionResponse> {
        return this.http.get<DirectionResponse>(`${this.apiUrl}/code/${code}`);
    }

    createDirection(direction: Direction): Observable<DirectionResponse> {
        return this.http.post<DirectionResponse>(this.apiUrl, direction);
    }

    updateDirection(id: number, direction: Direction): Observable<DirectionResponse> {
        return this.http.put<DirectionResponse>(`${this.apiUrl}/${id}`, direction);
    }

    deleteDirection(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    assignerDirecteur(directionId: number, directeurId: number): Observable<DirectionResponse> {
        return this.http.post<DirectionResponse>(`${this.apiUrl}/${directionId}/directeur/${directeurId}`, {});
    }
}
