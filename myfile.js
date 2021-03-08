import {hello} from './handler.js'
hello((errors, result)=>{
        console.log(errors);
        console.log(result);
})