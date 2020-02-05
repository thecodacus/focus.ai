import { Observable, Subject } from 'rxjs';
import  { existsSync,lstatSync, readdirSync, mkdirSync, writeFile } from 'fs'
import * as Path from 'path'
import { TouchBarSegmentedControl } from 'electron';


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

export interface Plugin{
    initialize(),
    main(context:PluginContext),
}

export interface TaggedPlugin extends Plugin{
    id:string
}
interface PluginRankItem{id:string,rank:number}

export class PluginManager{

    resultsObs:Subject<any[]>=new Subject();
    results:Result[]=[];
    plugins:Array<TaggedPlugin>
    pluginRankings:Array<PluginRankItem>=[]
    public configDir:(string|null);
    
    constructor(){
        this.plugins=[];
        let localPluginsPath =Path.join(__dirname, "plugins");
        this.LoadModules(localPluginsPath);
        
        let homeDir=process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
        if(homeDir!=null) this.configDir=Path.join(homeDir,'.focus')

        if(!this.configDir) return
        if(!existsSync(this.configDir))mkdirSync(this.configDir)
        let externalPluginsPath = Path.join(this.configDir, "plugins");
        if(!existsSync(externalPluginsPath))mkdirSync(externalPluginsPath)
        this.LoadModules(externalPluginsPath);

        this.InitializeRanks()
    }

    LoadModules(pluginPath){
        //let normalizedPath = require("path").join(__dirname, "plugins");
        console.log(`Loading Modules from ${pluginPath}`);
        readdirSync(pluginPath).forEach((file)=>{
            try{
                if (!lstatSync(Path.join(pluginPath,file)).isDirectory()) return;
                let plugin:TaggedPlugin=require(Path.join(pluginPath , file));
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
        console.log("ordering results");
        this.RankResults()
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

    RankResults(){
        this.results=this.results.sort((a,b)=>{
            let aRank=this.pluginRankings.filter((rank)=>rank.id==a.pluginId)
            let bRank=this.pluginRankings.filter((rank)=>rank.id==b.pluginId)
            if(aRank.length==0&&bRank.length==0) return 0
            if(aRank.length==0&&bRank.length!=0) return 1
            if((aRank.length!=0&&bRank.length==0)) return -1
            if(aRank[0].rank==bRank[0].rank) return 0
            return aRank[0].rank-bRank[0].rank
        })
    }
    InitializeRanks(){
        this.pluginRankings=[]
        if(!this.configDir) return
        let pluginsRanksPath = Path.join(this.configDir, "pluginsRanks.json");
        if(!existsSync(pluginsRanksPath)){
            let json = JSON.stringify(this.pluginRankings);
            writeFile(pluginsRanksPath,json,(err)=>{if(err)console.log(err)})
        }
        else{
            try{
                this.pluginRankings=require(pluginsRanksPath)
            }
            catch(err){}
            if (! this.pluginRankings.length )this.pluginRankings=[]
        }
        let tags=this.plugins.map(plugin=>plugin.id)
        let ranked=this.pluginRankings.map(rank=>rank.id)
        let unranked=tags.filter(value => ranked.indexOf(value)==-1)
        let ranks=this.pluginRankings.map(rank=>rank.rank)
        if(!unranked.length) return;
        console.debug("ranking new plugins");
        
        let rank=0
        if(ranks.length==0)rank=0
        else rank=ranks.reduce((pre,cur)=>cur>pre? cur: pre)+1
        unranked.forEach(tag=>{
            this.pluginRankings.push({
                id:tag,
                rank:rank
            })
        })
        let json = JSON.stringify(this.pluginRankings);
        writeFile(pluginsRanksPath,json,(err)=>{if(err)console.log(err)})
    }
    
}

