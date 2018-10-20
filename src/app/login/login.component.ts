import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AlertService } from '../services/alert.service';
import { ContractService } from '../services/contract.service';
import { AuthenticationService } from '../services/authentication.service';

declare var uportconnect: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  constructor(  
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private contractService: ContractService) {   }

  ngOnInit() {
    this.authenticationService.logout();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  connect() {
    this.authenticationService.login()
    .then((user) =>{
      localStorage.setItem('currentUser', JSON.stringify(user));
      var localUser = localStorage.getItem('currentUser');
      console.log(localUser);
      this.router.navigate([this.returnUrl]);
    });    
  }

  register() {
    //this.alertService.openDialog("Non Implementato");
    this.authenticationService.login()
    .then((user) =>{
      const decodedId = uportconnect.MNID.decode(user.address);
      var address = decodedId.address;
      this.contractService.registerUser(user.name,address);

    }); 

  }



}



