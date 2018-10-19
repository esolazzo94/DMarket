import { Injectable, Inject } from '@angular/core';
import Web3 from 'web3';
import { WEB3 } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  constructor(
    @Inject(WEB3) private web3: Web3
  ) { }

  
}
