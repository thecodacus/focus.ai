import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterContentChecked, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit, AfterViewInit {
  @Input('term') public term = 'some text';
  @Output('termChange') public termChange:EventEmitter<string>=new EventEmitter<string>()
  public termShadow:string="";
  @Input('autofill') public autofill:string="test"
  @ViewChild("editable",{static:true}) editable:ElementRef;
  constructor() {
    this.term="";
  }
  ngOnInit() {
  }
  ngAfterViewInit() {
    this.editable.nativeElement.focus()
  }
  onTermChange(event){
    this.term=event.target.textContent
    this.termShadow=this.term+this.autofill
    this.termChange.emit(this.term)
  }
  onKeyDown(event){
    console.log(event);
    if(event.code==="ArrowRight"){
      let sel = window.getSelection();
      if(sel.focusOffset==this.term.length){
        event.target.textContent=this.termShadow
        sel.collapse(event.target.firstChild, this.termShadow.length-1);
      }
    }
  }

}
