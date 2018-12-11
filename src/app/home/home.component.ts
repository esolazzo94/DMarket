import { Component, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute} from '@angular/router';
import Web3 from 'web3';

import { UserComponent } from '../user/user.component';
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


  public viewUser:string;

  public localUser;
  public address;
  public loadMarket = false;
  public loadUser = false;
  public loadProducts = false;
  public loadPurchases = false;
  public loadSales = false;
  public loadInfo = true;
  public balance: string;

  reset(){
    this.loadMarket = false; 
    this.loadUser = false;
    this.loadProducts = false;
    this.loadPurchases = false;
    this.loadSales = false;
    this.loadInfo = false; 
    this.ngOnInit();
  }
    
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private contractService: ContractService,
    private userComponent: UserComponent,
    @Inject(WEB3) private web3: Web3) {
      this.web3 = authenticationService.getWeb3();
      this.localUser = new User;
      this.localUser = JSON.parse(localStorage.getItem('currentUser'));
      this.viewUser = this.localUser.address;
      this.contractService.balance$.subscribe(result =>{
      this.balance = result;
      });  
    }

    ngOnInit() {
      var localUser = JSON.parse(localStorage.getItem('currentUser'));
      this.contractService.getBalance(localUser.address);     
  }



  exit() {
    this.authenticationService.logout();  
    this.router.navigate(['/login']);
  }

  public getUserView(address?: string) {
    this.reset();
    if(address) this.viewUser = address;
    else this.viewUser = this.localUser.address;
    this.loadUser=true;
  }

  
  }
