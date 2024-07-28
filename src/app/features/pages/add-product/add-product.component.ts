import {Component, OnDestroy, OnInit, signal, Signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ProductService} from "../../services/product.service";
import {NgClass} from "@angular/common";
import {ModalComponent} from "../../../shared/modal/modal.component";
import {ModalTypes} from "../../../domain/ui/ModalTypes";
import {ErrorApi} from "../../../domain/api/ErrorApi";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass, ModalComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
})
export class AddProductComponent implements OnInit, OnDestroy {

  productForm: FormGroup;
  protected readonly ModalTypes = ModalTypes;
  today: Signal<Date>;
  productAlreadyExist: WritableSignal<boolean>;
  errorCreatingProduct: WritableSignal<ErrorApi>;
  addProductSubs: Subscription = new Subscription();
  checkProductExistsSubs: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder, private productService: ProductService, private router: Router) {
    this.productForm = this.formBuilder.group({
      id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', Validators.required],
      date_revision: [{value: '', disabled: true}, Validators.required]
    });
    this.today = signal(new Date());
    this.productAlreadyExist = signal(false);
    this.errorCreatingProduct = signal({isError: false, error: ''});
  }

  ngOnInit(): void {
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

  checkIfProductExists(): void {
    if (this.productForm.valid) {
      this.checkProductExistsSubs = this.productService.checkIfProductExists(this.productForm.get('id')?.value).subscribe({
        next: (productExist: boolean) => {
          productExist ? this.productAlreadyExist.set(true) : this.submitAddProduct()
        },
        error: (error: Error) => {
          this.errorCreatingProduct.set({isError: true, error: error.message});
        },
      });
    }
  }

  submitAddProduct(): void {
    this.addProductSubs = this.productService.createProduct(this.productForm.getRawValue()).subscribe({
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
    this.addProductSubs.unsubscribe();
    this.checkProductExistsSubs.unsubscribe();
  }
}
