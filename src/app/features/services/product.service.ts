import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, Observable, tap} from "rxjs";
import {ProductApi} from "../../domain/api/ProductApi";
import {environment} from "../../../environments/environment";
import {Product} from "../../domain/ui/Product";
import {Data} from "../../domain/api/Data";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly baseUrl: string;


  constructor(private http: HttpClient) {
    this.baseUrl = environment.baseUrl;
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Data>(`${this.baseUrl}/products`).pipe(
      map(response => response.data.map(product => {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          logo: product.logo,
          releaseDate: product.date_release,
          revisionDate: product.date_revision
        }
      }))
    );
  }

  createProduct(product: ProductApi): Observable<ProductApi> {
    return this.http.post<ProductApi>(`${this.baseUrl}/products`, product);
  }

  updateProduct(product: ProductApi, productId: string): Observable<ProductApi> {
    return this.http.put<ProductApi>(`${this.baseUrl}/products/${productId}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/products/${id}`);
  }

  checkIfProductExists(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/products/verification/${id}`);
  }
}
