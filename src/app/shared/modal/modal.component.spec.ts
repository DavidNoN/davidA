import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { ModalTypes } from '../../domain/ui/ModalTypes';
import {ComponentRef, SimpleChange} from '@angular/core';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set default image URL for Info modal type', () => {
    expect(component.imageUrl()).toBe('https://png.pngtree.com/png-vector/20190411/ourmid/pngtree-vector-information-icon-png-image_925431.jpg');
  });

  it('should change icon based on modal type', () => {
    component.ngOnChanges({
      typeModal: new SimpleChange(null, ModalTypes.Ok, true)
    });
    expect(component.imageUrl()).toBe('https://png.pngtree.com/png-vector/20190411/ourmid/pngtree-vector-information-icon-png-image_925431.jpg');

    component.ngOnChanges({
      typeModal: new SimpleChange(ModalTypes.Ok, ModalTypes.Error, false)
    });
    expect(component.imageUrl()).toBe('https://png.pngtree.com/png-vector/20190411/ourmid/pngtree-vector-information-icon-png-image_925431.jpg');

    component.ngOnChanges({
      typeModal: new SimpleChange(ModalTypes.Error, ModalTypes.Warn, false)
    });
    expect(component.imageUrl()).toBe('https://png.pngtree.com/png-vector/20190411/ourmid/pngtree-vector-information-icon-png-image_925431.jpg');
  });

  it('should return correct button class based on modal type', () => {
    component.typeModal = (() => ModalTypes.Ok) as any;
    expect(component.buttonClass).toBe('button button-ok');

    component.typeModal = (() => ModalTypes.Error) as any;
    expect(component.buttonClass).toBe('button button-error');

    component.typeModal = (() => ModalTypes.Info) as any;
    expect(component.buttonClass).toBe('button button-info');

    component.typeModal = (() => ModalTypes.Warn) as any;
    expect(component.buttonClass).toBe('button button-warn');

  });

  it('should emit true when modalAction is called', () => {
    spyOn(component.modalActionOutput, 'emit');
    component.modalAction();
    expect(component.modalActionOutput.emit).toHaveBeenCalledWith(true);
  });

  it('should emit true when closeModal is called', () => {
    spyOn(component.closeModalOutput, 'emit');
    component.closeModal();
    expect(component.closeModalOutput.emit).toHaveBeenCalledWith(true);
  });

  it('should handle input properties correctly', () => {
    let testComponent: ModalComponent;
    let componentRef: ComponentRef<ModalComponent>;
    testComponent = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('title', 'title');
    componentRef.setInput('description', 'description');
    componentRef.setInput('buttonText', 'buttonText');
    componentRef.setInput('typeModal', ModalTypes.Warn);
    fixture.detectChanges();
    expect(testComponent.title()).toBe('title');
    expect(testComponent.description()).toBe('description');
    expect(testComponent.buttonText()).toBe('buttonText');
    expect(testComponent.typeModal()).toBe(ModalTypes.Warn);
  });
});
