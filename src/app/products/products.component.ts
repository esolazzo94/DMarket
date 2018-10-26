import { Component, OnInit } from '@angular/core';

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
    this.reset();
    this.loadDetail = true;
   }

  ngOnInit() {
  }

}
