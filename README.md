# Why this module?

There are many schemes which give some support for private access.
However most of them suffer from at least one of the following problems.

1. They rely on the use of closures to create private members. 
   In this scheme you don't have private access for the class but for the objec.
   This means you cannot access private members of objects of the same class which are not
   the object itself (this).  An access to other objects private members can be helpful when
   create a method which compares or copies an object
   
2. They requires you to put extra code which makes your code less clean


This module doesn't use closures and for most cases you code normally like with regular classes.
Also, to create methods and variables you only need to create a key (you only need the this keyword to access them afterwards),
this make it even cleaner compres to ES5 type classes



# The class stucture


"use-strict"

const _class = require('./access_modes')

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
        */
    }
})


Only public block is mandatory.
All dynamically created variables and methods inside the code will automatically become private members, 


# 



