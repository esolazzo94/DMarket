import { Component, OnInit } from '@angular/core';

import { User } from '../models/user.model';
import { ContractService } from '../services/contract.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  private productIndex = 0;
  private localUser;

  public products:Array<Product>;
  public actualPage;
  public loaded=false;

  constructor(private contractService: ContractService) {
    this.products = [];
   }

  async ngOnInit() {
    var user = await this.contractService.updateUser();
    localStorage.setItem('currentUser', JSON.stringify(user)); 
    this.products = await this.contractService.getUserProducts();
    this.loaded = true;
    this.actualPage = 0;
  }

  onPaginateChange(event) {
    this.actualPage= event.pageIndex;
  }

  async delete() {
    this.contractService.deleteProduct(this.products[this.actualPage].hash,this.actualPage);
    var user = await this.contractService.updateUser();
    localStorage.setItem('currentUser', JSON.stringify(user)); 
    this.products = await this.contractService.getUserProducts();
    this.actualPage = 0;
  }

}



