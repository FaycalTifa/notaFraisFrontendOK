import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { Section } from '../../models/entities/entities';

@Injectable({
  providedIn: 'root'
})
export class SectionService {

    private apiUrl = 'http://localhost:8080/api/sections';

    constructor(private http: HttpClient) { }

    createSection(section: Section): Observable<Section> {
        return this.http.post<Section>(this.apiUrl, section);
    }

    updateSection(id: number, section: Section): Observable<Section> {
        return this.http.put<Section>(`${this.apiUrl}/${id}`, section);
    }

    deleteSection(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getAllSections(): Observable<Section[]> {
        return this.http.get<Section[]>(this.apiUrl);
    }

    getSectionById(id: number): Observable<Section> {
        return this.http.get<Section>(`${this.apiUrl}/${id}`);
    }

    getSectionsByService(serviceId: number): Observable<Section[]> {
        return this.http.get<Section[]>(`${this.apiUrl}/service/${serviceId}`);
    }
}
