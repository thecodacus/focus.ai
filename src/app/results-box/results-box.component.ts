import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export interface Preview{
  type:string,
  content:string
}

export interface Result{
  title?:string,
  subtytle?:string,
  preview?:Preview,
  hint?:string,
  icon?:string
}


@Component({
  selector: 'app-results-box',
  templateUrl: './results-box.component.html',
  styleUrls: ['./results-box.component.scss']
})
export class ResultsBoxComponent implements OnInit {
  @Input('results') public results:Result[] = [{title:"testing"}];
  @Input('selected') public selected:number = 0;
  @Output('selectedChange') public resultSelected:EventEmitter<number>=new EventEmitter<number>()
  constructor() { }

  ngOnInit() {
  }

  

}
