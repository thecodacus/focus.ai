import { CodacusPlugin, PluginContext } from "../../plugin";

let plugin:CodacusPlugin= {
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
    }
}

module.exports=plugin