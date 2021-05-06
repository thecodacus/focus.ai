import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterContentChecked,
  AfterViewInit,
  OnChanges,
} from '@angular/core';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
})
export class SearchBoxComponent implements OnInit, AfterViewInit, OnChanges {
  @Input('term') public term = 'some text';
  @Output('termChange')
  public termChange: EventEmitter<string> = new EventEmitter<string>();
  @Input('hint') public hint: string = 'test';
  @Input('title') public title: string = '';
  @ViewChild('editable', { static: true }) editable: ElementRef;

  public autofill: string = '';
  public termShadow: string = '';
  constructor() {
    this.term = '';
  }
  ngOnInit() {}
  ngAfterViewInit() {
    this.editable.nativeElement.focus();
  }
  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {}
  onTermChange(event) {
    this.term = event.target.textContent;
    this.termChange.emit(this.term);
  }
  onKeyDown(event: KeyboardEvent | any) {
    console.log(event);
    if (
      event.code === 'ArrowRight' &&
      (this.term !== '' || this.term != undefined)
    ) {
      let sel = window.getSelection();
      if (sel.focusOffset == this.term.length) {
        event.target.textContent = this.autofill;
        sel.collapse(event.target.firstChild, this.autofill.length - 1);
      }
    } else if (event.code === 'Enter' && this.term != undefined) {
      event.preventDefault();
      //this.term = this.term.split('\n').join("")
      let range = document.createRange();
      range.selectNodeContents(event.target);
      let sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      event.preventDefault();
    }
  }
  getAutoShadowText(): string {
    this.autofill = this.term;
    if (this.term === '' || this.term == undefined) return 'focus';
    else if (this.hint && this.hint != '') {
      return this.term + ' ' + this.hint;
    } else if (this.title.toLowerCase().startsWith(this.term.toLowerCase())) {
      let part = this.title.slice(this.term.length);
      this.autofill = this.term + part;
      return this.autofill;
    } else if (this.hint && this.hint != '') {
      return `${this.term} - ${this.autofill}`;
    } else return this.autofill;
  }
  onInput() {}
}
