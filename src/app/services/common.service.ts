import { Injectable } from '@angular/core';

declare var IpfsApi: any;

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  public sendFile(file:any):Promise<string> {
    return new Promise<string>((resolve) => {
      const ipfs = new IpfsApi('ipfs.infura.io', '5001', {protocol: 'https'});

    ipfs.files.add(ipfs.types.Buffer.from(file), (err, result) => {
                    resolve(result[0].hash);
                }); 

    });
     

  }


}
