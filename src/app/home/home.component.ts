import { Component, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute} from '@angular/router';
import Web3 from 'web3';

import { AlertService } from '../services/alert.service';
import { ContractService } from '../services/contract.service';
import { AuthenticationService, WEB3 } from '../services/authentication.service';
import { User } from '../models/user.model';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {


  public localUser;
  public address;
  public loadMarket = false;
  public loadUser = false;
  public loadProducts = false;
  public loadPurchases = false;
  public loadSales = false;
  public balance$: Observable<string>;

  reset(){
    this.loadMarket = false; 
    this.loadUser = false;
    this.loadProducts = false;
    this.loadPurchases = false;
    this.loadSales = false; 
  }
    
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private contractService: ContractService,
    @Inject(WEB3) private web3: Web3) {
      this.localUser = new User;
      this.localUser = JSON.parse(localStorage.getItem('currentUser'));

      //console.log(localUser);
      //this.contractService.getBalance(/*localUser.address*/'0x273231D0669268e0D7Fce9C80b302b1F007224B0');
      
        //this.balance$ = this.contractService.getBalance('0x273231D0669268e0D7Fce9C80b302b1F007224B0');


      //console.log(this.balance$);
    }

    ngOnInit() {
      var localUser = JSON.parse(localStorage.getItem('currentUser'));
      this.balance$ = this.contractService.getBalance(localUser.address);
          
  }


  exit() {
    this.authenticationService.logout();  
    this.router.navigate(['/login']);
  }

  
  }
