import { Component, OnInit } from '@angular/core';
import { AddProductComponent } from '../add-product/add-product.component'

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  
  public loadDetail = false;
  public loadAdd = false;
  public loadRemove = false;


  reset(){
    this.loadDetail = false;
    this.loadAdd = false;
    this.loadRemove = false;
  }

  constructor() {
   }

  ngOnInit() {
    this.reset();
    this.loadDetail = true;
  }

  receiveMessage($event) {
    this.reset();
    this.loadDetail = $event;
  }

}
