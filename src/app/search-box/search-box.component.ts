import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit {
  @Input('term') public term = 'some text';
  @Output('termChange') public termChange:EventEmitter<string>=new EventEmitter<string>()
  public termShadow:string="";
  @Input('autofill') public autofill:string="test"
  constructor() {
    this.term="";
  }

  ngOnInit() {
  }
  onTermChange(event){
    this.term=event.target.textContent
    this.termShadow=this.term+this.autofill
    this.termChange.subscribe(this.term)
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
