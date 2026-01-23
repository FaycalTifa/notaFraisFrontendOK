import { Injectable } from '@angular/core';
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {getPosteIdentifier, IPoste} from "../../models/poste/poste";

export type EntityResponseType = HttpResponse<IPoste>;
export type EntityArrayResponseType = HttpResponse<IPoste[]>;


@Injectable({
  providedIn: 'root'
})
export class PosteService {
  public resourceUrl = environment.api + 'postes';
  constructor(protected http: HttpClient) {}

  createPoste(poste: IPoste): Observable<EntityResponseType> {
    return this.http.post<IPoste>(this.resourceUrl, poste, { observe: 'response' });
  }
  updatePoste(poste: IPoste): Observable<EntityResponseType> {
    return this.http.put<IPoste>(
        `${this.resourceUrl}/${getPosteIdentifier(poste) as number}`,
        poste,
        { observe: 'response' }
    );
  }
  getAllPostes(): Observable<EntityArrayResponseType> {
    return this.http.get<IPoste[]>(this.resourceUrl, {  observe: 'response' });
  }
  deletePoste(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }
}
