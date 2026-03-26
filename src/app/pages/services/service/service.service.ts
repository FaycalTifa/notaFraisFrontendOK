import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {getServiceIdentifier, IService} from '../../models/service/service';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ServiceEntity, ServiceResponse} from '../../models/entities/entities';

export type EntityResponseType = HttpResponse<IService>;
export type EntityArrayResponseType = HttpResponse<IService[]>;

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
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

    getAllServices(): Observable<ServiceResponse[]> {
        return this.http.get<ServiceResponse[]>(this.apiUrl);
    }

    getServiceById(id: number): Observable<ServiceEntity> {
        return this.http.get<ServiceEntity>(`${this.apiUrl}/${id}`);
    }

    getServicesByDirection(directionId: number): Observable<ServiceEntity[]> {
        return this.http.get<ServiceEntity[]>(`${this.apiUrl}/direction/${directionId}`);
    }
}
