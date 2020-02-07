import { Plugin, PluginContext, Result } from "../../plugin";

let plugin:Plugin= {
    initialize(){
    },
    main(context:PluginContext){
        context.display([{
            title:`You have entered ${context.term}`,
            preview:{
                type:'html',
                content:`<h1>${context.term}</h1>`
            }
        }])
    },
    onSelect(result:Result){}
}

module.exports=plugin