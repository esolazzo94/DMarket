import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../services/alert.service';
import { ContractService } from '../services/contract.service';

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
  
  @Output() messageEvent = new EventEmitter<boolean>();

  private hash:any;

  constructor(private _formBuilder: FormBuilder,
    private alertService: AlertService,
    private contractService: ContractService) { }

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

  async send() {
    this.contractService.addProduct(this.firstFormGroup.value.firstCtrl,this.secondFormGroup.value.secondCtrl,this.hash).then((flag)=>{
      this.messageEvent.emit(flag);
    });
    
  }

  hashFile(event) {
    const reader = new FileReader(); 
    if(event.target.files && event.target.files.length === 1) {
      const [file] = event.target.files;
      reader.readAsArrayBuffer(event.target.files[0]);
  
      reader.onloadend = () => {
        var contents = reader.result;
      var hash = crypto.subtle.digest('SHA-256',contents).then(hashed=>{
        this.hash = hashed;
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
