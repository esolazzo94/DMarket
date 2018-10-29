import { Component, OnInit } from '@angular/core';

import { User } from '../models/user.model';
import { ContractService } from '../services/contract.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  private productIndex = 0;
  private localUser;

  constructor(private contractService: ContractService) {

   }

  ngOnInit() {
    this.localUser = new User;
    this.localUser = JSON.parse(localStorage.getItem('currentUser'));
    this.contractService.updateUser(this.localUser);
    this.localUser = JSON.parse(localStorage.getItem('currentUser'));

    this.contractService.getUserProducts(this.localUser);
  }

}
