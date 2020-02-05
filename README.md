# Why this module?

There are many schemes which give some support for private access.
However most of them suffer from at least one of the following problems.

1. They rely on the use of closures to create private members. 
   In this scheme you don't have private access for the class but for the objec.
   This means you cannot access private members of objects of the same class which are not
   the object itself (this).  An access to other objects private members can be helpful when
   create a method which compares or copies an object.
   
2. They requires you to put extra code which makes your code less clean.


This module doesn't use closures and for most cases you code normally like with regular classes (by using 'this' to access  any of the members).
Also, to create methods and variables you only need to create a key (you only need the this keyword to access them afterwards),
this make it even cleaner compare to ES5 type classes.



# Special case

If you need to access private member of a object of the same class by is not 'this' then you use the following syntax:

this.cast(obj)

Example:

```
const _class = require('access-modes')


const Person = _class({

    public : {
   
        getName : function() {    
            return this.name
        }, 
        
        compare: function(person) {     
            return this.name == this.cast(person).name
            
        }   
        
    },  
    
    private : {
        name : "",      
        init : function(name) {    
            this.name = name     
        }     
    }   
})
```



# The class stucture

```
"use-strict"

const _class = require('access-modes')

module.exports = _class(superClass,{

    static: {
        /*
            Non constants static variables and methods 
        */
        constants : {
            /*
                Static constant variables and methods
            */
        }
    },
    
    public : {
        /*
            Public variables and methods
        */
    },
    
    protected : { 
        /*
            Protected variables and methods.
            These variables and methods cannot be accessed outside the class
            but can be overriden by any subclass
        */
    },
    
    private : {  
    
        init : function() {
            /*
              Put initialization code here
              This method can also be places in the public or protected blocks
            */
        }
        /*
        
        Private variables and methods.
        These variables and methods cannot be accessed outside the class
        Dynamically created members inside this code are private by defualt
        */
    }
})
```

Only public block is mandatory.
If you only have private variables and not methods then you don't need for the private block.
You can simply create them dynamically and they will become private by default


# getObjectKeys

Every object is create with a special private method which returns the keys of the object as they appear in the class structure above.
For exampe:  using this method for the person class above will return:
    {   public : ['name', 'compare'] ,  private : ['name','init] }



