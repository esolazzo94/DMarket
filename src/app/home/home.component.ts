import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute} from '@angular/router';

import { AlertService } from '../services/alert.service';
import { AuthenticationService } from '../services/authentication.service';

declare var uportconnect: any;


const connect = new uportconnect.Connect('Erasmo Solazzo\'s new app', {
  clientId: '2ouwybCUvNbKAHHpuUbSqK68xun1FsJaaP2',
  signer: uportconnect.SimpleSigner('2fe3ac212cf3b4defc85e9e803b59bf63198f35e8f7e2254d01f07fbd81c6874'),
  network: 'rinkeby'
});

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
    private alertService: AlertService) {
      var localUser = JSON.parse(localStorage.getItem('currentUser'));
      this.name = localUser.name;

      const decodedId = uportconnect.MNID.decode(localUser.address);
      this.address = decodedId.address;
      console.log(connect.getProvider());

      console.log(localUser);
    }

  exit() {
    this.authenticationService.logout();  
    this.router.navigate(['/login']);
  }

  
  }
