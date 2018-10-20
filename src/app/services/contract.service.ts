import { Injectable, Inject } from '@angular/core';
import Web3 from 'web3';
import { WEB3 } from '../services/authentication.service';
import * as data from '../../../contract/build/contracts/Market.json';


@Injectable({
  providedIn: 'root'
})
export class ContractService {

  private contractInstance;

  constructor(
    @Inject(WEB3) private web3: Web3) {
    

      var abi = JSON.parse(JSON.stringify(data)).abi;
      var contract = web3.eth.contract(abi);
      this.contractInstance = contract.at('0x97bab90ce5d3b641fd15666c14bd1edf24b3c600');
      console.log(this.contractInstance);
   }

  registerUser(name:string, address:string) {

  }

  
}
