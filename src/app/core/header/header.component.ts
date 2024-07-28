import { Component } from '@angular/core';
import {TableComponent} from "../../features/pages/table/table.component";
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    TableComponent,
    NgOptimizedImage
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
