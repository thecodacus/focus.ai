import { Plugin, PluginContext, Result, configDir } from "../../plugin";

import {flow} from 'lodash'
import  os, { type } from 'os'
import { readdirSync, lstatSync, statSync, Stats, readFileSync } from "fs";
import * as Path from 'path'
const pdf = require('pdf-parse');
const fg = require('fast-glob');
const FlexSearch = require("flexsearch");


function getDirList(path:string){
    let stats;
    try{
        stats = lstatSync(path)
    }
    catch(err){}
    
    let info:any = {
        path: path,
        name: Path.basename(path),
        modified:stats.mtime
    };
    if (stats.isDirectory()) {
        console.log("indexing dir "+path);
        info.type = "folder";
        
        
        try{
            readdirSync(path).forEach((child)=>{
                if(child[0]===".")return
                if(child[0]==="@")return
                getDirList(Path.join(path, child));
            });
        }
        catch(err){
            // will do something later
        }
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        console.log("indexing file"+path);
        info.type = "file";
    }
}

function indexWin(){

}
async function  indexMacOs(){
    //getDirList("/Users/anirban") 
    const entries = await fg(['/Users/anirban/**/*.pdf'], 
    { 
        dot: true, suppressErrors:true, absolute:true,
        ignore: ['/Users/anirban/Library/**/*', '**/*.app/**/*']
    });
    
    let docs:any[]=[];
    let fileIndex = new FlexSearch();
    for (let index = 0; index < entries.length; index++) {
        try{
            const entry = entries[index];
            console.log("reading", entry);
            
            let stat:Stats=lstatSync(entry)
            let dataBuffer=readFileSync(entry);
            let content=await pdf(dataBuffer);
            docs.push({
                path:entry,
                name: Path.basename(entry),
                dirname:Path.dirname(entry),
                modified:stat.mtime,
                isFile:!stat.isDirectory(),
                content:content.text,
                metadata:content.metadata

            })
            fileIndex.add(index,content.text)
        }
        catch(err){}
        
    }
    console.log("gor all the data");
    
    //console.log(docs);
    return {docs,fileIndex}
}
let plugin:Plugin= {
    initialize(){
        this.configuration={}
        if(os.platform()==='darwin') {
            indexMacOs().then(res=>{
                this.configuration=res;
            })
        }
    },
    main(context:PluginContext){
        if(!this.configuration.docs) return;
        let result=this.configuration.fileIndex.search(context.term, 5);
        console.log("result from plugin",result);
        
        context.display(result.result.map(res=>{
            return {
                title:`${this.configuration.docs[res.id].name}`,
                preview:{
                    type:'text',
                    content:`${this.configuration.docs[res.id].name}`
                },
                hint:this.configuration.docs[res.id].dirname
            }
        }))
    },
    onSelect(result:Result){}
}

module.exports=plugin