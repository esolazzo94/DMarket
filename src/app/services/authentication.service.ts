import { Injectable, InjectionToken } from '@angular/core';
//import { Connect, SimpleSigner,  } from 'uport-connect';
import Web3 from 'web3';


declare var uportconnect: any;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private connect;
  private web3;

  constructor() {
    this.reset();
   }

  reset() {
    this.connect = new uportconnect.Connect('Erasmo Solazzo\'s new app', {
      clientId: '2ouwybCUvNbKAHHpuUbSqK68xun1FsJaaP2',
      signer: uportconnect.SimpleSigner('2fe3ac212cf3b4defc85e9e803b59bf63198f35e8f7e2254d01f07fbd81c6874'),
      network: 'rinkeby'
    });
    //this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    //this.web3 = this.connect.getWeb3();// new Web3(this.getProvider());
    //this.web3 = new Web3(this.connect.getProvider());
    //this.web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/aeed36baad5e48838a5b7869b2da89fa'));
  }

  login() {
    var result = this.connect.requestCredentials({
      requested: ['name','avatar'],
      notifications: true // We want this if we want to recieve credentials
    });
    this.reset();
    return result;
  }

  getConnect() {
    return this.connect;
  }

  getProvider() {
    return this.connect.getProvider();
  }

  getWeb3() {
    return this.web3;
  }

  transaction() {
    this.connect.createTxRequest();
  }

  logout(){
    localStorage.removeItem('currentUser');
  }
}

export const WEB3 = new InjectionToken<Web3>('web3', {
  providedIn: 'root',
  factory: () => new Web3(/*connect.getProvider()*/ new Web3.providers.HttpProvider('http://localhost:7545'))
  //factory: () => new Web3(/*connect.getProvider()*/ new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/aeed36baad5e48838a5b7869b2da89fa'))
});