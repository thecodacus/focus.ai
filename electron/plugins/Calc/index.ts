import { Plugin, PluginContext, Result } from "../../plugin";
const clipboardy = require('clipboardy');

let plugin:Plugin= {
    initialize(){

    },
    main(context:PluginContext){
        if(context.term==="") return;
        try{
            let result=eval(context.term)
            if(""+result===context.term ||!result) return;
            context.display([{
                title:`Calc ${result}`,
                preview:{
                    type:'html',
                    content:`<h1>${result}</h1>`
                },
                hint:` = ${result}`,
                meta:{
                    value:result
                }
            }])
        }
        catch(err){}
    },
    onSelect(result:Result){
        clipboardy.writeSync(`${result.meta.value}`);
    }
}

module.exports=plugin