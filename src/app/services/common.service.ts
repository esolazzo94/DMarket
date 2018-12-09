import { Injectable } from '@angular/core';

import { ContractService } from '../services/contract.service';

declare var IpfsApi: any;

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private contractService:ContractService ) { }

  public sendFile(file:any):Promise<string> {
    return new Promise<string>((resolve) => {
      const ipfs = new IpfsApi('ipfs.infura.io', '5001', {protocol: 'https'});

    ipfs.files.add(ipfs.types.Buffer.from(file), (err, result) => {
                    resolve(result[0].hash);
                }); 
    });
  }

  public hashing(fileBytes:any):Promise<string> {
    return new Promise<string>((resolve) => {
      var that=this;
      var hash = crypto.subtle.digest('SHA-256',fileBytes).then(hashed=>{
        resolve(that.contractService.hash(hashed));
        
      });
    });
  }


}
