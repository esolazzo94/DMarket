import { Component, OnInit, OnDestroy } from '@angular/core';
import {Subscription} from 'rxjs';



@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  private subscription: Subscription;
  protected message: string;

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
    
  }

}
