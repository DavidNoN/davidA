import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UpdateProductComponent } from './update-product.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../../domain/ui/Product';

describe('UpdateProductComponent', () => {
  let component: UpdateProductComponent;
  let fixture: ComponentFixture<UpdateProductComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockProduct: Product = {
    id: 'test123',
    name: 'Test Product',
    description: 'This is a test product',
    logo: 'test-logo.png',
    releaseDate: '2024-07-28',
    revisionDate: '2025-07-28'
  };

  beforeEach(async () => {
    const productServiceSpyObj = jasmine.createSpyObj('ProductService', ['getProducts', 'updateProduct']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, UpdateProductComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpyObj },
        { provide: Router, useValue: routerSpyObj },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'test123'
              }
            }
          }
        }
      ]
    }).compileComponents();

    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    productServiceSpy.getProducts.and.returnValue(of([mockProduct]));
    fixture = TestBed.createComponent(UpdateProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with product data', () => {
    expect(component.productForm.getRawValue()).toEqual({
      id: 'test123',
      name: 'Test Product',
      description: 'This is a test product',
      logo: 'test-logo.png',
      date_release: '2024-07-28',
      date_revision: '2025-07-28'
    });
  });

  it('should update date_revision when date_release changes', () => {
    const dateRelease = '2024-08-01';
    const expectedDateRevision = '2025-08-01';

    component.productForm.get('date_release')?.setValue(dateRelease);

    expect(component.productForm.get('date_revision')?.value).toBe(expectedDateRevision);
  });

  it('should reset the form when resetForm is called', () => {
    component.resetForm();

    expect(component.productForm.value).toEqual({
      id: null,
      name: null,
      description: null,
      logo: null,
      date_release: null
    });
  });

  it('should call submitAddProduct when checkForm is called with valid form', () => {
    spyOn(component, 'submitAddProduct' as any);
    component.productForm.setValue({
      id: 'test123',
      name: 'Updated Product',
      description: 'This is an updated product',
      logo: 'updated-logo.png',
      date_release: '2024-08-01',
      date_revision: '2025-08-01'
    });

    component.checkForm();

    expect(component.submitAddProduct).toHaveBeenCalled();
  });

  it('should not call submitAddProduct when checkForm is called with invalid form', () => {
    spyOn(component, 'submitAddProduct' as any);
    component.productForm.get('name')?.setValue(''); // Making the form invalid

    component.checkForm();

    expect(component.submitAddProduct).not.toHaveBeenCalled();
  });

  it('should call updateProduct and navigate to home on successful update', () => {
    productServiceSpy.updateProduct.and.returnValue(of({}) as any);
    component.productForm.setValue({
      id: 'test123',
      name: 'Updated Product',
      description: 'This is an updated product',
      logo: 'updated-logo.png',
      date_release: '2024-08-01',
      date_revision: '2025-08-01'
    });

    component.submitAddProduct();

    expect(productServiceSpy.updateProduct).toHaveBeenCalledWith(component.productForm.getRawValue(), 'test123');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should set errorCreatingProduct if an error occurs during update', () => {
    const errorMessage = 'Update failed';
    productServiceSpy.updateProduct.and.returnValue(throwError(() => new Error(errorMessage)));

    component.submitAddProduct();

    expect(component.errorCreatingProduct().isError).toBeTrue();
    expect(component.errorCreatingProduct().error).toBe(errorMessage);
  });

  it('should close modal when closeModal is called with true', () => {
    component.productAlreadyExist.set(true);
    component.closeModal(true);
    expect(component.productAlreadyExist()).toBeFalse();
  });

  it('should unsubscribe from updateProductSubs on ngOnDestroy', () => {
    spyOn(component.updateProductSubs, 'unsubscribe' as any);
    component.ngOnDestroy();
    expect(component.updateProductSubs.unsubscribe).toHaveBeenCalled();
  });
});
