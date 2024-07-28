import {Component, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {DatePipe, NgIf, NgOptimizedImage, NgSwitch, NgSwitchCase} from "@angular/common";
import {RouterLink} from "@angular/router";
import {ProductService} from "../../services/product.service";
import {ErrorApi} from "../../../domain/api/ErrorApi";
import {ModalTypes} from "../../../domain/ui/ModalTypes";
import {ModalComponent} from "../../../shared/modal/modal.component";
import {Product} from "../../../domain/ui/Product";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink,
    ModalComponent,
    NgIf,
    DatePipe,
    NgSwitch,
    NgSwitchCase,
    ReactiveFormsModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit, OnDestroy {

  products: WritableSignal<Product[]> = signal<Product[]>([]);
  productsBackUp: WritableSignal<Product[]> = signal<Product[]>([]);
  errorGettingProducts: WritableSignal<ErrorApi> = signal<ErrorApi>({isError: false, error: ''});
  isProductRemoved: WritableSignal<ErrorApi> = signal<ErrorApi>({isError: false, error: ''});
  errorProductRemoved: WritableSignal<ErrorApi> = signal<ErrorApi>({isError: false, error: ''});
  confirmationRemoveProduct: WritableSignal<ErrorApi> = signal<ErrorApi>({isError: false, error: ''});
  productToRemove: Product = {} as Product;
  protected readonly ModalTypes = ModalTypes;
  searchProductControl= new FormControl('');
  productsPerViewControl= new FormControl(5);
  getProductSubs: Subscription = new Subscription();
  deleteProductSubs: Subscription = new Subscription();

  constructor(private productService: ProductService) {
    this.searchProductControl.setValue('');
  }

  ngOnInit(): void {
    this.initialLoad();
    this.searchProductChanges();
    this.productsPerView();
  }

  initialLoad() {
    this.getProductSubs = this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.productsBackUp.set(products)
        this.products.set(products.slice(0,5));
      },
      error: (error: Error) => {
        this.errorGettingProducts.set({isError: true, error: error.message});
      },
    });
  }

  searchProductChanges() {
    this.searchProductControl.valueChanges?.subscribe(value => {
        this.products.set(this.productsBackUp());
        this.products.set(this.productsBackUp().filter(product => product.name.toLowerCase().includes(<string>value?.toLowerCase())));
    });
  }

  productsPerView() {
    this.productsPerViewControl.valueChanges.subscribe( value => {
      if (value) {
        console.log(value);
        this.products.set(this.productsBackUp().slice(0, value));
      }
    });
  }

  closeModal(event: boolean) {
    if (event) {
      this.errorGettingProducts.set({isError: false, error: ''});
      this.confirmationRemoveProduct.set({isError: false, error: ''});
      this.errorProductRemoved.set({isError: false, error: ''});
      this.isProductRemoved.set({isError: false, error: ''});
    }
  }

  deleteProductConfirmation(product: Product): void {
    this.productToRemove = product;
    this.confirmationRemoveProduct.set({isError: true, error: `Seguro que quieres eliminar a ${product.name}`});
  }

  deleteProduct() {
    this.closeModal(true);
    this.deleteProductSubs = this.productService.deleteProduct(this.productToRemove.id).subscribe({
      next: () => {
        this.isProductRemoved.set({isError: true, error: `Product ${this.productToRemove.name} eliminado.`});
        this.initialLoad();
      },
      error: (error: Error) => this.errorProductRemoved.set({isError: true, error: error.message})
    });
  }

  ngOnDestroy(): void {
    this.getProductSubs.unsubscribe();
    this.deleteProductSubs.unsubscribe();
  }


}
