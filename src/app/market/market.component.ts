import { Component, OnInit } from '@angular/core';
import { ContractService } from '../services/contract.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../services/alert.service';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.css']
})
export class MarketComponent implements OnInit {

  private index:number;
  public actualProduct:Product;
  public noProduct:boolean;
  productCode: FormGroup;

  constructor(private contractService: ContractService,
    private alertService: AlertService,
    private _formBuilder: FormBuilder) {
    this.index=0;
    this.actualProduct=new Product();
    this.noProduct=true;
   }

   async getProduct(index: string) {
    this.actualProduct = await this.contractService.getProduct(this.productCode.value.firstCtrl);
    if (this.actualProduct.description === "") {
      this.noProduct=true;
      this.alertService.openDialog("File inesistente nel Market",true); 
    }
    else {
      this.noProduct=false;
    }
   }

   async buyProduct() {
    var localUser = new User;
    localUser = JSON.parse(localStorage.getItem('currentUser'));
    if (localUser.address.toLowerCase() === this.actualProduct.seller.toLowerCase()) {
      this.alertService.openDialog("Non puoi acquistare un tuo prodotto",true);
    }
    else {
      var res = await this.contractService.buyProduct(this.actualProduct.seller,this.actualProduct.hash,this.actualProduct.price);
      this.actualProduct=new Product();
      this.noProduct=true;
      if (res) this.alertService.openDialog("Richiesta acquisto inviata",false);
      else this.alertService.openDialog("Errore nella richiesta",true);
    }
   }

  async ngOnInit() {  
    this.productCode = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    /*await this.getProduct(this.index);
    if (this.actualProduct.description === "") this.noProduct=true;*/
  }

}
