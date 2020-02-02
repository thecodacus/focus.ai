import { Observable, Subject } from 'rxjs';
import {map} from 'rxjs/operators'

export interface Preview{
    type:string,
    content:string
}

export interface Result{
    pluginId?:string,
    title?:string,
    subtytle?:string,
    preview?:Preview,
    hint?:string,
    icon?:string
}

export interface PluginContext{
    display(context:Result[])
    term:string,
}

export interface CodacusPlugin{
    id:string,
    initialize(),
    main(context:PluginContext),
}

function LoadModules():Array<CodacusPlugin>{
    let normalizedPath = require("path").join(__dirname, "plugins");
    console.log(`Loading Modules from ${normalizedPath}`);
    let plugins:Array<CodacusPlugin>=[]
    require("fs").readdirSync(normalizedPath).forEach((file)=>{
        try{
            let plugin:CodacusPlugin=require("./plugins/" + file);
            plugin.initialize()
            plugin.id=file;
            plugins.push(plugin)
            console.log("module loaded",file);
        }
        catch(err){
            console.error("Ubable to load module",err);
            
        }
    });
    return plugins

}
let plugins=LoadModules();
let resultsObs:Subject<any[]>=new Subject();
let results:Result[]=[];

const PushUpdates=(id:string,newResults:Result[])=>{
    console.log("pushilg chunk", newResults);
    newResults=newResults.map(x=>{x.pluginId=id; return x})
    results=results.filter(result=>result.pluginId!==id)
    results=[...results, ...newResults]
    console.log("pushilg result", results);
    resultsObs.next(results)
}
export default (term):Observable<Result[]>=>{
    results=[]
    plugins.forEach(plugin=>{
        try{
            plugin.main({
                display:(output)=>{
                    PushUpdates(plugin.id,output)
                },
                term:term,
            })
            console.log(results);
            
        }
        catch(err){
            console.error(err);
        }
    })
    resultsObs.next(results)
    return resultsObs.asObservable()
}

