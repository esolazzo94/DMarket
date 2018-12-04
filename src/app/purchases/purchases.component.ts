import { Component, OnInit } from '@angular/core';
import { ContractService } from '../services/contract.service';
import { AlertService } from '../services/alert.service';

import { Escrow } from '../models/escrow.model';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit {

  public escrows:Array<Escrow>;
  public panelOpenState = false;

  constructor(private contractService: ContractService,
    private alertService: AlertService) { 
      this.escrows = [];
    }

  async ngOnInit() {
    var user = await this.contractService.updateUser();
    localStorage.setItem('currentUser', JSON.stringify(user)); 
    this.escrows = await this.contractService.getUserPurchases();
    console.log(this.escrows);
  }

}
