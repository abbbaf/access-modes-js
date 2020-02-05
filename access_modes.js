"use-strict"

const publicMap = new WeakMap()
const blocks = ['public','private', 'protected','static']

function bindAll(obj,context) {
    context = context || obj
    for (let key in obj) {
        if (typeof obj[key] == 'function') 
            obj[key] = obj[key].bind(context)
    }
}


function getMembers(obj) {

    //check for duplicates
    let fullObject = {}
    for (let block in obj) {
        if (block == 'static') continue
        for (let key in obj[block]) {
            if (key in fullObject) 
                throw new Error("All methods and variable names must be unique\n" + 
                key + " already exist")
        }
        fullObject = uniteObjects(fullObject,obj[block])
    }
    return fullObject
}

function uniteObjects(target,...objects) {
    for (let obj of objects) {
        for (let key in obj) {
            Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(obj,key))
        }
    }
    return target
}

function getObj(obj) {
    return uniteObjects({},obj)
}


function wrapper(obj,fullObject,superClass,privateMap) {
    let staticFunction = function(...args) {
        const init = function(...args) { 
            let newFullObject =  getObj(fullObject)
            let newPublicObject = getObj(obj.public)

            if (superClass) 
                initSuperClass(newPublicObject,newFullObject,superClass,...args)

            setReferencesToFullObject(newPublicObject,newFullObject)

            bindAll(newPublicObject,newFullObject)
       

            publicMap.set(newPublicObject,newFullObject)
            privateMap.set(newPublicObject,newFullObject)
    
            Object.setPrototypeOf(newPublicObject,prototype)

            if ('init' in newFullObject) 
                newFullObject.init(...args)

            return newPublicObject
        }
        
        return init(...args)
    }
    
    staticFunction.prototype = superClass ? new superClass() : Object
    let prototype = staticFunction.prototype

    setStaticMembers(staticFunction,obj)

    return staticFunction
}

function initSuperClass(newPublicObject,newFullObject,superClass,...args) {

        let parentObject = new superClass(...args)
        let parentFullObject = publicMap.get(parentObject)

        let objectKeys = parentFullObject.getObjectKeys()
        
        
        //Update overriden members in parent
        for (let key of objectKeys.public) {
            if (!(key in newPublicObject)) continue
            Object.defineProperty(parentFullObject,key,
                Object.getOwnPropertyDescriptor(newFullObject,key))
        }

        let protectedObject = newFullObject.getObjectKeys().protected
        if (protectedObject) {
            for (let key of objectKeys.protected) {
                if (!protectedObject.includes(key)) continue
                Object.defineProperty(parentFullObject,key,
                    Object.getOwnPropertyDescriptor(newFullObject,key))
            }
        }        

        uniteObjects(newPublicObject,parentObject,newPublicObject)

}

function setStaticMembers(staticFunction,obj) {
    if ('static' in obj) 
        for (let key in obj.static) {
            if (key == 'constants' && typeof obj.static[key] == 'object') {

                for (let constant in obj.static[key]) {
                    //check for duplicates
                    if (constant in obj.static) {
                        throw new Error("All methods and variable names must be unique\n" + 
                        constant + " already exist")
                    } 
   
                    Object.defineProperty(staticFunction,constant,{ 
                        get : () => obj.static.constant[constant],
                        set : () => {
                             throw new Error("Cannot reassign constant value " + constant) }
                    })

                }
            }
            else Object.defineProperty(staticFunction,key,
                    Object.getOwnPropertyDescriptor(obj.static,key))
        }

}

function setReferencesToFullObject(newPublicObject,newFullObject) {
    let propertyDescriptors = Object.getOwnPropertyDescriptors(newPublicObject)
    let property
    for (let key in propertyDescriptors) {
        property = propertyDescriptors[key]

        if ('value' in property && 
            !['function','object'].includes(typeof property.value)) {
                Object.defineProperty(newPublicObject,key,{
                    get :  () =>  newFullObject[key]
                })
                Object.defineProperty(newPublicObject,key,{
                    set : (value) => {
                        newFullObject[key] = value 
                    }
                })
            }
        if ('get' in property) {
            Object.defineProperty(newPublicObject,property,
                property.get.bind(newFullObject))
        }
        if ('set' in property && property.set != undefined) {
            Object.defineProperty(newPublicObject,property,
                property.set.bind(newFullObject))
        }
    }

}



module.exports = function(superClass,obj) {
            const privateMap = new WeakMap()

            if (obj == undefined) {
                obj = superClass
                superClass = undefined
            }
            for (let key in obj) {
                if (!blocks.includes(key))
                    throw new Error(key + " must be inside " + blocks.slice(0,-1).join(", ") + 
                    " or " + blocks.slice(-1) + " block")
            }
            if (!('public' in obj)) throw new Error("Public block not found")
            
            obj.private.cast = (o) => privateMap.get(o)
            obj.private.getObjectKeys = () => {
                let result = {}
                for (block in obj) {
                    result[block] = Object.keys(obj[block])
                }
                return result
            }
            

            return wrapper(obj,getMembers(obj),superClass,privateMap)
    
    }

