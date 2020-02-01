import { Injectable } from '@angular/core';
import {ipcRenderer} from 'electron'
@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  constructor() { }
  sendCommandToNode(command:string,data:any){
    ipcRenderer.send(command,data)
  }
}
