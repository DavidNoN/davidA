import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {TableComponent} from "./features/pages/table/table.component";
import {HeaderComponent} from "./core/header/header.component";
import {BodyComponent} from "./core/body/body.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TableComponent, HeaderComponent, BodyComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'devsu';
}
