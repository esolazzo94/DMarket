import { Injectable } from '@angular/core';

declare var uportconnect: any;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private _connect: any;

  constructor() { }

  login() {
    this._connect = new uportconnect.Connect('Erasmo Solazzo\'s new app', {
      clientId: '2ouwybCUvNbKAHHpuUbSqK68xun1FsJaaP2',
      signer: uportconnect.SimpleSigner('2fe3ac212cf3b4defc85e9e803b59bf63198f35e8f7e2254d01f07fbd81c6874'),
      network: 'rinkeby'
    });

    this._connect.requestCredential({//  .requestCredential({
      requested: ['name'],
      notifications: true // We want this if we want to recieve credentials
    })
    .then((credentials) => {
      console.log("Credenials:", credentials); 
    });
  }

  logout(){

  }
}
