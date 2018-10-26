import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  isFileUploaded = false;
  
  private hash:string;

  constructor(private _formBuilder: FormBuilder,
    private alertService: AlertService,) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.thirdFormGroup = this._formBuilder.group({
      file: [null, Validators.required]
    });
    this.hash = null;
  }

  send() {
    console.log(this.firstFormGroup.value.firstCtrl);
    console.log(this.secondFormGroup.value.secondCtrl);
    console.log(this.hash);
  }

  hashFile(event) {
    const reader = new FileReader(); 
    if(event.target.files && event.target.files.length === 1) {
      const [file] = event.target.files;
      reader.readAsArrayBuffer(event.target.files[0]);
  
      reader.onloadend = () => {
        var contents = reader.result;
      var hash = crypto.subtle.digest('SHA-256',contents).then(hashed=>{
        this.hash = this.convertArrayBufferToHexaDecimal(hashed);
        this.isFileUploaded = true;
      });
      }    
    }
   else {
     if (event.target.files.length >= 1) {
      this.alertService.openDialog("Puoi caricare un solo file",true);   
     }
     else {
      this.alertService.openDialog("Errore nel caricamento file",true);  
     }
   }
}


  convertArrayBufferToHexaDecimal(buffer) {
    var data_view = new DataView(buffer)
    var iii, len, hex = '', c;
    for(iii = 0, len = data_view.byteLength; iii < len; iii += 1) 
    {
        c = data_view.getUint8(iii).toString(16);
        if(c.length < 2) 
        {
            c = '0' + c;
        }   
        hex += c;
    }
    return hex;
  }

}
