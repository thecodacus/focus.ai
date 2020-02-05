import { Component } from '@angular/core';
import { ElectronCommand, ElectronUIService } from 'src/services/electron.service';
import { ElectronService } from 'ngx-electron';
import { timer, Subject } from 'rxjs';
import {map, tap, switchMap} from 'rxjs/operators'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'electron-ng-app';
  public term:string=""
  public hint:string=""
  public searchTitle:string=""
  public expand:boolean=false
  public termChange = new Subject<string>();
  //public results:Subject<any[]>=new Subject();
  public results:any[]=[{title:"testing", subtitle:"testing sub", hint:"testing"},{title:"testing", subtitle:"testing sub"}];
  public arrowkeyLocation: number=0;
  
  constructor(private electron:ElectronService, private UIService:ElectronUIService){
    this.RegisterShapeChanges()
    this.termChange.subscribe(term=>this.QueryContent(term))
    if (this.electron.isElectronApp){
      this.electron.ipcRenderer.on(ElectronCommand.OnResults,(event,arg)=>{this.UpdateContent(event,arg)})  
    }
  }
  RegisterShapeChanges(){
    this.termChange
    .pipe(
      tap(term=>this.term=term),
      map(term=>!(term===""|| term==undefined)),
      switchMap(shouldExpand=>{
        if(shouldExpand){
          if (this.electron.isElectronApp)this.electron.ipcRenderer.send(ElectronCommand.ResizeWindow,{height:650});
          return timer(500).pipe(map(()=>shouldExpand))
        }
        else{
          this.expand=false;
          return timer(200).pipe(map(()=>shouldExpand))
        } 
      }),
      tap(shouldExpand=>{
        if(!shouldExpand){
          if(this.electron.isElectronApp)
            this.electron.ipcRenderer.send(ElectronCommand.ResizeWindow,{height:150})
        }
        else this.expand=true;
      })
    )
    .subscribe()
  }
  QueryContent(term){
    if (this.electron.isElectronApp)this.electron.ipcRenderer.send(ElectronCommand.GetResults,term)
  }
  UpdateContent(event:Electron.IpcRendererEvent,arg){
    console.log(arg)
    //this.results.next(arg)
    this.results=arg
    if(!this.results) this.results=[]
    this.correctSelection()
    if(this.results.length>0){
      this.updateAutoFill(this.results[this.arrowkeyLocation])
    }
  }
  keyDown(event: KeyboardEvent) {
    if(!this.results) return
    switch (event.keyCode) {
      case 38: // this is the ascii of arrow up
        this.arrowkeyLocation--;
        break;
      case 40: // this is the ascii of arrow down
        this.arrowkeyLocation++;
        break;
    }
    this.correctSelection()
  }
  correctSelection(){
    if(this.arrowkeyLocation<0)this.arrowkeyLocation=0
    else if (this.arrowkeyLocation>=this.results.length)this.arrowkeyLocation=this.results.length-1
  }
  updateAutoFill(result){
    if(result.hint) this.hint=result.hint
    else this.hint=""
    this.searchTitle=result.title
  }
}
