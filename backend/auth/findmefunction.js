const User = require('../auth/schema')



const getallusers = async () => {
    let allUsers = await User.find()

    if(allUsers.length > 0 ){
        return allUsers
    }else{
        return [{message:'No User'}]
    }
}



const findmefunction = () => {
    const newBody = {
        allUsers:getallusers()
    }
    return newBody
}




module.exports = findmefunction