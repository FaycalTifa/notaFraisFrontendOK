import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Agent} from '../../models/entities/entities';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

    private apiUrl = 'http://localhost:8080/api/agents';

    constructor(private http: HttpClient) { }

    createAgent(agent: Agent): Observable<Agent> {
        return this.http.post<Agent>(this.apiUrl, agent);
    }

    updateAgent(id: number, agent: Agent): Observable<Agent> {
        return this.http.put<Agent>(`${this.apiUrl}/${id}`, agent);
    }

    deleteAgent(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getAllAgents(): Observable<Agent[]> {
        return this.http.get<Agent[]>(this.apiUrl);
    }

    getAgentById(id: number): Observable<Agent> {
        return this.http.get<Agent>(`${this.apiUrl}/${id}`);
    }

    getAgentsBySection(sectionId: number): Observable<Agent[]> {
        return this.http.get<Agent[]>(`${this.apiUrl}/section/${sectionId}`);
    }
}
