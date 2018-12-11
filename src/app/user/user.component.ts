import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { ContractService } from '../services/contract.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit,OnChanges {

  @Input() private user: string;
  public actualUser: User;

  constructor(private contractService: ContractService) {
    this.actualUser = new User;
   }

  async ngOnInit() {
    this.actualUser = await this.contractService.getUser(this.user);
  }

  async ngOnChanges() {
    this.actualUser = await this.contractService.getUser(this.user);
  }

}
