import {Component, OnDestroy, signal, Signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ModalComponent} from "../../../shared/modal/modal.component";
import {ErrorApi} from "../../../domain/api/ErrorApi";
import {ProductService} from "../../services/product.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ModalTypes} from "../../../domain/ui/ModalTypes";
import {NgClass} from "@angular/common";
import {map, Subscription} from "rxjs";
import {Product} from "../../../domain/ui/Product";
import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [
    FormsModule,
    ModalComponent,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.scss'
})
export class UpdateProductComponent implements OnDestroy {
  productForm: FormGroup;
  protected readonly ModalTypes = ModalTypes;
  today: Signal<Date>;
  productAlreadyExist: WritableSignal<boolean>;
  errorCreatingProduct: WritableSignal<ErrorApi>;
  productId: string;
  updateProductSubs: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder, private productService: ProductService, private router: Router, private activatedRoute: ActivatedRoute) {

    this.productId = this.activatedRoute.snapshot.paramMap.get('id') || '';

    this.productForm = this.formBuilder.group({
      id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', Validators.required],
      date_revision: [{value: '', disabled: true}, Validators.required]
    });

    this.productService.getProducts().pipe(
      map(products => products.filter(product => product.id === this.productId)),
    ).subscribe({
      next: result => {
        this.initialLoadForm(result[0]);
      }
    });


    this.today = signal(new Date());
    this.productAlreadyExist = signal(false);
    this.errorCreatingProduct = signal({isError: false, error: ''});
  }

  initialLoadForm(product: Product): void {
    this.productForm = this.formBuilder.group({
      id: [product.id, [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      name: [product.name, [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: [product.description, [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: [product.logo, Validators.required],
      date_release: [product.releaseDate, Validators.required],
      date_revision: [{value: product.revisionDate, disabled: true}, Validators.required]
    });

    this.subscribeToReleaseDate();
  }

  subscribeToReleaseDate() {
    this.productForm.get('date_release')?.valueChanges.subscribe((value: string) => {
      if (value) {
        const releaseDate = new Date(value);
        const revisionDate = new Date(releaseDate);
        revisionDate.setFullYear(releaseDate.getFullYear() + 1);
        this.productForm.get('date_revision')?.setValue(revisionDate.toISOString().split('T')[0]);
      }
    });
  }

  resetForm(): void {
    this.productForm.reset();
  }

  checkForm(): void {
    if (this.productForm.valid) {
      this.submitAddProduct()
    }
  }

  submitAddProduct(): void {
    this.updateProductSubs = this.productService.updateProduct(this.productForm.getRawValue(), this.productId).subscribe({
      next: async () => {
        await this.router.navigate(['/home']);
      },
      error: (error: Error) => {
        this.errorCreatingProduct.set({isError: true, error: error.message});
      },
    });
  }

  closeModal(event: boolean) {
    if (event) {
      this.productAlreadyExist.set(false);
    }
  }

  ngOnDestroy(): void {
    this.updateProductSubs.unsubscribe();
  }
}
