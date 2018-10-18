import { Injectable } from '@angular/core';
import { Connect, SimpleSigner,  } from 'uport-connect';


declare var uportconnect: any;



const connect = new uportconnect.Connect('Erasmo Solazzo\'s new app', {
  clientId: '2ouwybCUvNbKAHHpuUbSqK68xun1FsJaaP2',
  signer: uportconnect.SimpleSigner('2fe3ac212cf3b4defc85e9e803b59bf63198f35e8f7e2254d01f07fbd81c6874'),
  network: 'rinkeby'
});

//const web3 = connect.getWeb3();



@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private _connect = connect;

  constructor() { }

  login() {
    return connect.requestCredentials({
      requested: ['name','avatar'],
      notifications: true // We want this if we want to recieve credentials
    })
  }

  logout(){

  }
}
