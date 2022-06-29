async function suma({num1, num2}){
     var result = num1 + num2
    return result

}

async function resta({num1, num2}){
 
    var result = num1-  num2
    return result

}

async function division({num1, num2}){
 
    var result = num1 / num2
    return result

}

async function multiplicacion({num1, num2}){
 
    var result = num1*num2
    return result

}

/**
 * async function todos({num1,num2}){

    var hola = [suma({num1,num2}), resta({num1,num2}),multiplicacion({num1,num2}),division({num1,num2})]
    console.log(hola)
    return hola

    a = num1+num2
    b= num1-num2
    c= num1*num2
    d=num1/num2
    e= [a,b,c,d]
    console.log(e)
    return e
}
 */

module.exports ={
    suma,
    resta,
    division,
    multiplicacion,
    //todos
}
