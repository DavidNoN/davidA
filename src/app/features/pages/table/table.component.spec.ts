import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { TableComponent } from './table.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../../domain/ui/Product';
import { ModalComponent } from '../../../shared/modal/modal.component';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const mockProducts: Product[] = [
    { id: '1', name: 'Product 1', description: 'Description 1', logo: 'logo1.png', releaseDate: '2024-01-01', revisionDate: '2025-01-01' },
    { id: '2', name: 'Product 2', description: 'Description 2', logo: 'logo2.png', releaseDate: '2024-02-01', revisionDate: '2025-02-01' },
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProductService', ['getProducts', 'deleteProduct']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, TableComponent, ModalComponent],
      providers: [{ provide: ProductService, useValue: spy }]
    }).compileComponents();

    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    productServiceSpy.getProducts.and.returnValue(of(mockProducts));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on initialization', () => {
    expect(component.products()).toEqual(mockProducts.slice(0, 5));
    expect(component.productsBackUp()).toEqual(mockProducts);
  });

  it('should handle error when loading products', () => {
    productServiceSpy.getProducts.and.returnValue(throwError(() => new Error('Error loading products')));
    component.initialLoad();
    expect(component.errorGettingProducts().isError).toBeTrue();
    expect(component.errorGettingProducts().error).toBe('Error loading products');
  });

  it('should filter products based on search input', () => {
    component.searchProductControl.setValue('Product 1');
    expect(component.products().length).toBe(1);
    expect(component.products()[0].name).toBe('Product 1');
  });

  it('should update products per view', () => {
    component.productsPerViewControl.setValue(1);
    expect(component.products().length).toBe(1);
  });

  it('should set up product for deletion confirmation', () => {
    const product = mockProducts[0];
    component.deleteProductConfirmation(product);
    expect(component.productToRemove).toEqual(product);
    expect(component.confirmationRemoveProduct().isError).toBeTrue();
    expect(component.confirmationRemoveProduct().error).toContain(product.name);
  });

  it('should delete product', () => {
    productServiceSpy.deleteProduct.and.returnValue(of(void 0));
    component.productToRemove = mockProducts[0];
    component.deleteProduct();
    expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith(mockProducts[0].id);
    expect(component.isProductRemoved().isError).toBeTrue();
    expect(component.isProductRemoved().error).toContain(mockProducts[0].name);
  });

  it('should handle error when deleting product', () => {
    productServiceSpy.deleteProduct.and.returnValue(throwError(() => new Error('Error deleting product')));
    component.productToRemove = mockProducts[0];
    component.deleteProduct();
    expect(component.errorProductRemoved().isError).toBeTrue();
    expect(component.errorProductRemoved().error).toBe('Error deleting product');
  });

  it('should close modals', () => {
    component.errorGettingProducts.set({isError: true, error: 'Error'});
    component.confirmationRemoveProduct.set({isError: true, error: 'Confirm'});
    component.errorProductRemoved.set({isError: true, error: 'Error'});
    component.isProductRemoved.set({isError: true, error: 'Removed'});

    component.closeModal(true);

    expect(component.errorGettingProducts().isError).toBeFalse();
    expect(component.confirmationRemoveProduct().isError).toBeFalse();
    expect(component.errorProductRemoved().isError).toBeFalse();
    expect(component.isProductRemoved().isError).toBeFalse();
  });

  it('should unsubscribe from subscriptions on destroy', () => {
    spyOn(component.getProductSubs, 'unsubscribe' as any);
    spyOn(component.deleteProductSubs, 'unsubscribe' as any);

    component.ngOnDestroy();

    expect(component.getProductSubs.unsubscribe).toHaveBeenCalled();
    expect(component.deleteProductSubs.unsubscribe).toHaveBeenCalled();
  });
});
