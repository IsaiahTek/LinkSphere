export const generateRandomKey = (length:number=12)=>{
    let randomNumber = ()=>{
        return (48 + Math.round(Math.random()*9))
    }
    let randomUpperCaseAlphabet = ()=>{
        return (65 + Math.round(Math.random()*25))
    }
    let randomLowerCaseAlphabet = ()=>{
        return (67 + Math.round(Math.random()*25))
    }
    let pointer = ()=>Math.round(Math.random()*1)
    let randomMatVal = ""
    for (let index = 0; index < length; index++) {
        randomMatVal += String.fromCharCode(
            pointer()?
                pointer()?
                    randomLowerCaseAlphabet():
                    randomUpperCaseAlphabet()
                :
                randomNumber())
    }
    return randomMatVal
}