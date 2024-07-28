import {Component, input, OnChanges, output, signal, SimpleChanges} from '@angular/core';
import {NgClass, NgOptimizedImage} from "@angular/common";
import {ModalTypes} from "../../domain/ui/ModalTypes";

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgClass
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent implements OnChanges {

  imageUrl = signal<string>('https://png.pngtree.com/png-vector/20190411/ourmid/pngtree-vector-information-icon-png-image_925431.jpg')
  title = input<string>('');
  description = input<string>('');
  buttonText = input<string>('');
  typeModal = input<ModalTypes>(ModalTypes.Info);
  modalActionOutput = output<boolean>()
  closeModalOutput = output<boolean>()

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['typeModal']) {
      this.changeIcon();
    }
  }

  changeIcon(): void {
    switch (this.typeModal()) {
      case ModalTypes.Info:
        this.imageUrl.set('https://png.pngtree.com/png-vector/20190411/ourmid/pngtree-vector-information-icon-png-image_925431.jpg');
        break;
      case ModalTypes.Ok:
        this.imageUrl.set('https://100dayscss.com/codepen/checkmark-green.svg');
        break;
      case ModalTypes.Error:
        this.imageUrl.set('https://100dayscss.com/codepen/alert.png');
        break;
      case ModalTypes.Warn:
        this.imageUrl.set('https://www.pngguru.in/storage/uploads/images/Warning%20sign%20symbol%20png%20download_1662573773_1848822552.webp');
        break;
      default:
        this.imageUrl.set('https://png.pngtree.com/png-vector/20190411/ourmid/pngtree-vector-information-icon-png-image_925431.jpg');
        break;
    }

  }

  get buttonClass() {
    switch (this.typeModal()) {
      case ModalTypes.Ok:
        return 'button button-ok';
      case ModalTypes.Error:
        return 'button button-error';
      case ModalTypes.Info:
        return 'button button-info';
      case ModalTypes.Warn:
        return 'button button-warn';
      default:
        return 'button button-info';
    }
  }

  modalAction(): void {
    this.modalActionOutput.emit(true);
  }

  closeModal(): void {
    this.closeModalOutput.emit(true);
  }

}
