import { Component, OnInit } from '@angular/core';
import { ProductServiceService } from '../product-service.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormControl, FormGroup } from '@angular/forms';


interface Plan {
  id: number;
  active: boolean;
  checkout_product_id: number;
  name: string;
  price: string;
  plan_duration: number;
  discount_value: string;
  show_in_product: boolean;
  external_id: {
    vindi: {
      plan_id: number;
      product_id: number;
    }
  };
  created_at: string;
  updated_at: string;
  price_modality: string;
  hasCoupon?: boolean;
  couponDiscount?: number;
}

interface Product {
  id: number;
  active: boolean;
  name: string;
  title: string;
  class_group_id: number;
  description: string;
  image: string;
  message_select: string;
  welcome_video: string;
  best_choice: number;
  contract: string;
  termination_term: string;
  position_card: number;
  modality: string;
  external_id: any;
  type: string;
  trial_period: number;
  plans: Plan[];
  validity_count: string;
  schedules: any[];
  schedules_2x: any;
  schedule_premium: any;
  scratched_price_card: string;
  price_card: string;
}

function getLowerPlanPrice (product: Product): string {
  let lowerPlanPrice = parseFloat(product.plans[0].price) / product.plans[0].plan_duration;

  for (let plan of product.plans) {
    if (parseFloat(plan.price) / plan.plan_duration < lowerPlanPrice) {
      lowerPlanPrice = parseFloat(plan.price) / plan.plan_duration;
    }
  }

  return lowerPlanPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

@Component({
  selector: 'app-table-component',
  templateUrl: './table-component.component.html',
  styleUrls: ['./table-component.component.scss']
})
export class TableComponentComponent implements OnInit {

  constructor(
    private productService: ProductServiceService,
    private sanitizer: DomSanitizer
  ) { }

  products: Product[] = [];

  selectedProduct: Product | null = null;

  couponFormGroup: FormGroup = new FormGroup({
    coupon: new FormControl('')
  });

  ngOnInit () {
    this.productService.getProducts()
      .subscribe((data: any) => {
        this.products = data;
      });
  }

  getSafeDescription (description: string): void {
    let safeDescription = this.sanitizer.bypassSecurityTrustHtml(description);

    let parser = new DOMParser();

    let doc = parser.parseFromString(safeDescription.toString(), 'text/html');

    let divElement = doc.body.firstChild;
    if (divElement && divElement.nodeType === Node.ELEMENT_NODE) {
      let textContent = divElement.textContent || '';
      console.log(textContent);
    }
  }

  productHasDiscount (product: Product): boolean {
    for (let plan of product.plans) {
      if (parseFloat(plan.discount_value) !== 0) {
        return true;
      }
    }
    return false;
  }

  productHasCouponDiscount (product: Product): boolean {
    for (let plan of product.plans) {
      if (plan.hasCoupon) {
        return true;
      }
    }
    return false;
  }

  getDiscountedValue (plan: Plan): string {
    return (parseFloat(plan.price) - parseFloat(plan.discount_value)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  async applyCoupon (): Promise<void> {
    let coupon = this.couponFormGroup.get('coupon')?.value;
    if (!coupon) {
      return;
    }

    this.selectedProduct?.plans.forEach(async (plan) => {
      if (plan.hasCoupon || !this.selectedProduct?.id) {
        return;
      }

      this.productService.applyCoupon({
        coupon,
        product: this.selectedProduct?.id,
        period: plan.plan_duration
      }).subscribe((data: any) => {
        const discountValue = parseFloat(data.discount);
        if (!(discountValue > 0)) {
          plan.hasCoupon = false;
          return;
        }
        plan.hasCoupon = true;
        plan.couponDiscount = parseFloat(data.discount);
      });
    });
    if (coupon) {
      console.log(coupon);
    }
  }

  getLowerPlanPrice (product: Product): string {
    return getLowerPlanPrice(product);
  }

  selectProduct (product: Product): void {
    this.selectedProduct = product;
  }

  deselectProduct (): void {
    this.selectedProduct = null;
  }


}
