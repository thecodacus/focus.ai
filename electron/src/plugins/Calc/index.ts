import { Plugin, PluginContext } from "../../plugin";

let plugin:Plugin= {
    initialize(){

    },
    main(context:PluginContext){
        if(context.term==="") return;
        let result=eval(context.term)
        if(""+result===context.term ||!result) return;
        context.display([{
            title:`Calc ${result}`,
            preview:{
                type:'html',
                content:`<h1>${result}</h1>`
            },
            hint:` = ${result}`
        }])
    }
}

module.exports=plugin