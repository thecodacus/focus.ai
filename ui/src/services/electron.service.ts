import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Subject } from 'rxjs';
import { remote, ipcRenderer } from 'electron';

export enum ElectronCommand {
  ResizeWindow = 'resize-window',
  GetResults = 'get-results',
  OnResults = 'on-results',
  OnSelect = 'on-select',
}
@Injectable({
  providedIn: 'root',
})
export class ElectronUIService {
  results: Subject<any> = new Subject();
  constructor(public electron: ElectronService) {
    if (this.electron.isElectronApp) {
      console.log(this.electron);
      this.electron.ipcRenderer.on(ElectronCommand.OnResults, (event, arg) => {
        this.OnResults(event, arg);
      });
    }
  }
  public QueryResults(term: string) {}
  public GetResultsStream() {
    return this.results.asObservable();
  }
  OnResults(event: Electron.IpcRendererEvent, arg) {
    this.results.next(arg);
  }
}
