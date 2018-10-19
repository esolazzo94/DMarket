import { Component, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute} from '@angular/router';
import Web3 from 'web3';

import { AlertService } from '../services/alert.service';
import { AuthenticationService, WEB3 } from '../services/authentication.service';

declare var uportconnect: any;


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  /*isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );*/

  public name;
  public address;
  public loadUser = false;
  public loadProducts = false;
  public loadPurchases = false;
  public loadSales = false;

  reset(){
    this.loadUser = false;
    this.loadProducts = false;
    this.loadPurchases = false;
    this.loadSales = false; 
  }
    
  constructor(
    private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    @Inject(WEB3) private web3: Web3) {
      var localUser = JSON.parse(localStorage.getItem('currentUser'));
      this.name = localUser.name;

      const decodedId = uportconnect.MNID.decode(localUser.address);
      this.address = decodedId.address;


      console.log(web3);
    }

  exit() {
    this.authenticationService.logout();  
    this.router.navigate(['/login']);
  }

  
  }
