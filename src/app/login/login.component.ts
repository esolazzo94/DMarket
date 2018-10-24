import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
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
      this.contractService.loginUser(user.address,this.returnUrl);
    });    
  }

  register() {
    //this.alertService.openDialog("Non Implementato");
    this.authenticationService.login()
    .then((user) =>{
      
      this.contractService.registerUser(user);

    }); 

  }



}



