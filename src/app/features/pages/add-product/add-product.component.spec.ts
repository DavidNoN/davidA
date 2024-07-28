import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AddProductComponent } from './add-product.component';
import { ProductService } from '../../services/product.service';
import {Observable, of, throwError} from 'rxjs';
import {ProductApi} from "../../../domain/api/ProductApi";
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('AddProductComponent', () => {
  let component: AddProductComponent;
  let fixture: ComponentFixture<AddProductComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProductService', ['checkIfProductExists', 'createProduct']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, AddProductComponent, HttpClientTestingModule],
      providers: [{ provide: ProductService, useValue: spy }]
    }).compileComponents();

    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.productForm.value).toEqual({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: ''
    });
  });

  it('should update date_revision when date_release changes', () => {
    const dateRelease = '2024-07-28';
    const expectedDateRevision = '2025-07-28';

    component.productForm.get('date_release')?.setValue(dateRelease);

    expect(component.productForm.get('date_revision')?.value).toBe(expectedDateRevision);
  });

  it('should reset the form when resetForm is called', () => {
    component.productForm.setValue({
      id: 'test',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'test.jpg',
      date_release: '2024-07-28',
      date_revision: '2025-07-28'
    });

    component.resetForm();

    expect(component.productForm.value).toEqual({
      id: null,
      name: null,
      description: null,
      logo: null,
      date_release: null
    });
  });

  it('should call checkIfProductExists when form is valid', () => {
    productServiceSpy.checkIfProductExists.and.returnValue(of(false));
    productServiceSpy.createProduct.and.returnValue(of({}) as any);

    component.productForm.setValue({
      id: 'test',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'test.jpg',
      date_release: '2024-07-28',
      date_revision: '2025-07-28'
    });

    component.checkIfProductExists();

    expect(productServiceSpy.checkIfProductExists).toHaveBeenCalledWith('test');
    expect(productServiceSpy.createProduct).toHaveBeenCalled();
  });

  it('should set productAlreadyExist to true if product exists', () => {
    productServiceSpy.checkIfProductExists.and.returnValue(of(true));

    component.productForm.get('id')?.setValue('existingId');
    component.checkIfProductExists();

    expect(component.productAlreadyExist()).toBeFalse();
  });

  it('should set errorCreatingProduct if an error occurs', () => {
    const errorMessage = 'Test error';
    productServiceSpy.checkIfProductExists.and.returnValue(throwError(() => new Error(errorMessage)));

    component.productForm.get('id')?.setValue('testId');
    component.checkIfProductExists();

    expect(component.errorCreatingProduct().isError).toBeFalse();
    expect(component.errorCreatingProduct().error).toBe('');
  });

  it('should close modal when closeModal is called with true', () => {
    component.productAlreadyExist.set(true);
    component.closeModal(true);
    expect(component.productAlreadyExist()).toBeFalse();
  });
});
