import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-preview-box',
  templateUrl: './preview-box.component.html',
  styleUrls: ['./preview-box.component.scss']
})
export class PreviewBoxComponent implements OnInit {
  @Input('content') public content:any=null;
  @Input('type') public type:any=null;
  constructor() { }

  ngOnInit() {
  }

}
