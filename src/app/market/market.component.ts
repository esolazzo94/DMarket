import { Component, OnInit } from '@angular/core';
import { ContractService } from '../services/contract.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.css']
})
export class MarketComponent implements OnInit {

  private index:number;
  public actualProduct:Product;
  public noProduct:boolean=false;

  constructor(private contractService: ContractService) {
    this.index=0;
    this.actualProduct=new Product();
   }

   async getProduct(index: number) {
    this.actualProduct = await this.contractService.getProduct(index);
   }

  async ngOnInit() {  
    await this.getProduct(this.index);
    if (this.actualProduct.description === "") this.noProduct=true;
  }

}
