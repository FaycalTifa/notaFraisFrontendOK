import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {ServiceEntity, ServiceResponse } from '../../models/entities/entities';

@Injectable({
  providedIn: 'root'
})
export class ServiceEntiteService {

    private apiUrl = `${environment.apiUrl}/services`;

    constructor(private http: HttpClient) { }

    createService(service: ServiceEntity): Observable<ServiceEntity> {
        return this.http.post<ServiceEntity>(this.apiUrl, service);
    }

    updateService(id: number, service: ServiceEntity): Observable<ServiceEntity> {
        return this.http.put<ServiceEntity>(`${this.apiUrl}/${id}`, service);
    }

    deleteService(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getAllServices(): Observable<ServiceEntity[]> {
        return this.http.get<ServiceEntity[]>(this.apiUrl);
    }

    getServiceById(id: number): Observable<ServiceEntity> {
        return this.http.get<ServiceEntity>(`${this.apiUrl}/${id}`);
    }

    getServicesByDirection(directionId: number): Observable<ServiceEntity[]> {
        return this.http.get<ServiceEntity[]>(`${this.apiUrl}/direction/${directionId}`);
    }
}
