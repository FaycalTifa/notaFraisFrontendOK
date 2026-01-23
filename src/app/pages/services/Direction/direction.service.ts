import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Direction} from '../../models/entities/entities';
import {tap} from 'rxjs/operators';
export type EntityResponseType = HttpResponse<Direction>;
export type EntityArrayResponseType = HttpResponse<Direction[]>;

@Injectable({
  providedIn: 'root'
})
export class DirectionService {

    private apiUrl = 'http://localhost:8080/api/direction';

    constructor(protected http: HttpClient) {
    }

    createDirection(direction: Direction): Observable<Direction> {
        return this.http.post<Direction>(this.apiUrl, direction);
    }

    updateDirection(id: number, direction: Direction): Observable<Direction> {
        return this.http.put<Direction>(`${this.apiUrl}/update/${id}`, direction);
    }

    deleteDirection(id: number, direction: Direction): Observable<Direction> {
        return this.http.put<Direction>(`${this.apiUrl}/deleteAgence/${id}`, direction);
    }

    getAllDirection(): Observable<Direction[]> {
        return this.http.get<Direction[]>(this.apiUrl);
    }

}
