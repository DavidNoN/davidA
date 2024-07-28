import { Routes } from '@angular/router';
import {AddProductComponent} from "./features/pages/add-product/add-product.component";
import {TableComponent} from "./features/pages/table/table.component";
import {UpdateProductComponent} from "./features/pages/update-product/update-product.component";

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: TableComponent },
  { path: 'add-product', component: AddProductComponent },
  { path: 'update-product/:id', component: UpdateProductComponent },
  { path: '**', redirectTo: 'home' },
];
