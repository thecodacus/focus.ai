import { Observable, Subject } from 'rxjs';
import  { existsSync,lstatSync, readdirSync, mkdirSync } from 'fs'
import * as Path from 'path'

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
    id?:string,
    initialize(),
    main(context:PluginContext),
}

export class PluginManager{
    resultsObs:Subject<any[]>=new Subject();
    results:Result[]=[];
    plugins:Array<CodacusPlugin>
    constructor(){
        this.plugins=[];
        let localPluginsPath =Path.join(__dirname, "plugins");
        this.LoadModules(localPluginsPath);
        let homeDir=process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
        let externalSettingsPath = Path.join(homeDir,".focus");
        if(!existsSync(externalSettingsPath))mkdirSync(externalSettingsPath)
        let externalPluginsPath = Path.join(homeDir,".focus", "plugins");
        if(!existsSync(externalPluginsPath))mkdirSync(externalPluginsPath)
        this.LoadModules(externalPluginsPath);

    }
    LoadModules(pluginPath){
        //let normalizedPath = require("path").join(__dirname, "plugins");
        console.log(`Loading Modules from ${pluginPath}`);
        readdirSync(pluginPath).forEach((file)=>{
            try{
                if (!lstatSync(Path.join(pluginPath,file)).isDirectory()) return;
                let plugin:CodacusPlugin=require(Path.join(pluginPath , file));
                plugin.initialize()
                plugin.id=file;
                this.plugins.push(plugin)
                console.log("module loaded",file);
            }
            catch(err){
                console.error("Ubable to load module",err);
                
            }
        });
    
    }    
    PushUpdates(id:string,newResults:Result[]){
        console.log("pushilg chunk", newResults);
        newResults=newResults.map(x=>{x.pluginId=id; return x})
        this.results=this.results.filter(result=>result.pluginId!==id)
        this.results=[...this.results, ...newResults]
        console.log("pushilg result", this.results);
        this.resultsObs.next(this.results)
    }
    GetResults(term):Observable<Result[]>{
        this.results=[]
        this.plugins.forEach(plugin=>{
            try{
                plugin.main({
                    display:(output)=>{
                        this.PushUpdates(plugin.id,output)
                    },
                    term:term,
                })
                console.log(this.results);
                
            }
            catch(err){
                console.error(err);
            }
        })
        this.resultsObs.next(this.results)
        return this.resultsObs.asObservable()
    }
    
}

