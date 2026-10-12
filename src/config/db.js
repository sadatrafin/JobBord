const { default: mongoose } = require("mongoose");

exports.dbConfig =  async ()=>{
    try {
       await mongoose.connect(process.env.DB_URL)
       console.log("database connection successfull")
    } catch (error) {
        console.log(error.message || "database connection  failed")
    }
}