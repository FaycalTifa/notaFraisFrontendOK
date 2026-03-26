import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { Section, SectionResponse } from '../../models/entities/entities';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SectionService {

    private apiUrl = `${environment.apiUrl}/sections`;


    constructor(private http: HttpClient) {}

    getAllSections(): Observable<SectionResponse[]> {
        return this.http.get<SectionResponse[]>(this.apiUrl);
    }

    getSectionById(id: number): Observable<SectionResponse> {
        return this.http.get<SectionResponse>(`${this.apiUrl}/${id}`);
    }

    getSectionsByService(serviceId: number): Observable<SectionResponse[]> {
        return this.http.get<SectionResponse[]>(`${this.apiUrl}/service/${serviceId}`);
    }

    createSection(section: Section): Observable<SectionResponse> {
        return this.http.post<SectionResponse>(this.apiUrl, section);
    }

    updateSection(id: number, section: Section): Observable<SectionResponse> {
        return this.http.put<SectionResponse>(`${this.apiUrl}/${id}`, section);
    }

    deleteSection(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    assignerChefSection(sectionId: number, chefId: number): Observable<SectionResponse> {
        return this.http.post<SectionResponse>(`${this.apiUrl}/${sectionId}/chef/${chefId}`, {});
    }
}
