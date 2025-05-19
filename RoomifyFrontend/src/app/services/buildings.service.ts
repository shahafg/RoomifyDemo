import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Building } from '../models/building';

@Injectable({
  providedIn: 'root'
})
export class BuildingsService {
  private buildingsUrl = 'http://localhost:3000/buildings';

  constructor(private http: HttpClient) {}

  getAllBuildings(): Observable<any> {
    return this.http.get<Building[]>(this.buildingsUrl);
  }
}
