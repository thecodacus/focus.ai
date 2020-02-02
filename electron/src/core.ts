import plugin from './plugin'
import { Result, Preview } from './plugin'
import { Observable } from 'rxjs'

export default(term:string):Observable<Result[]>=>{
    console.log("getting results from plugins");
    
    return plugin(term)
}