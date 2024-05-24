import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductServiceService {

  constructor(
    private http: HttpClient
  ) { }

  url = 'https://localhost:3000/';

  getProducts () {
    return this.http.get(this.url + 'info?type=english', {
      headers: {
        'token': '123-456-789'
      }
    });
  }
  applyCoupon ({
    coupon,
    product,
    period
  }: {
    coupon: string,
    product: number,
    period: number
  }
  ) {
    return this.http.get(this.url + 'coupon', {
      params: {
        code: coupon,
        product,
        period
      }
    })
  }
}
