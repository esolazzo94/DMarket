import { Component, OnInit } from '@angular/core';
import { ContractService } from '../services/contract.service';
import { AlertService } from '../services/alert.service';

import { Escrow } from '../models/escrow.model';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {

  public escrows:Array<Escrow>;
  public loaded = false;

  constructor(private contractService: ContractService,
    private alertService: AlertService) {
      this.escrows = [];
     }

  async ngOnInit() {
    var user = await this.contractService.updateUser();
    localStorage.setItem('currentUser', JSON.stringify(user)); 
    this.escrows = await this.contractService.getUserSales();
    this.loaded = true;
  }

}
