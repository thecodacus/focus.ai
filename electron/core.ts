import {PluginManager, Result} from './plugin'
import { Observable } from 'rxjs'


export class Core{
    private pluginManager:PluginManager
    constructor(){
        this.pluginManager=new PluginManager()
    }
    GetResults(term):Observable<Result[]>{
        console.log("getting results from plugins");
        return this.pluginManager.GetResults(term)
    }
    OnSelect(result:Result){
        this.pluginManager.OnSelect(result)
    }
}