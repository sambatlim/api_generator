exports.generateRouter = (tableName,column)=>{
return new Promise((resolve,reject)=>{
let routerTextToExport = `//// This Route Generated By apiGenerator ////`;
routerTextToExport += `
const express = require('express')
const router = express.Router()
const model = require('../model/index')
const authentication = require('../auth')
router.use(authentication.authenticate)

    `
    
// create router
routerTextToExport +=  `
router.post('/api/insert/${tableName}',(req,res)=>{
    ${generateDataColumn(column)}
    model.${tableName}.create(
        dataToProcess
    )
    .then((result)=>{
        res.status(200).send(result)
    })
    .catch((e)=>{
        res.status(500).send(e)
    });
})
`

//read all
routerTextToExport +=  `
router.get('/api/get_all/${tableName}',(req,res)=>{
    model.${tableName}.findAll()
    .then((result)=>{
        res.status(200).send(result)
    })
    .catch((e)=>{
        res.status(500).send(e)
    });
})
`

//read by id
routerTextToExport +=  `
router.get('/api/get/${tableName}/:id',(req,res)=>{
    model.${tableName}.findAll({
        where:{
            id:req.params.id
        }
    })
    .then((result)=>{
        res.status(200).send(result)
    })
    .catch((e)=>{
        res.status(500).send(e)
    });
})
`

//update by id
routerTextToExport +=  `
router.patch('/api/update/${tableName}/:id',(req,res)=>{
    ${generateDataColumn(column)}
    model.${tableName}.update({
        dataToProcess,
        where:{
            id:req.params.id
        }
    })
    .then((result)=>{
        res.status(200).send(result)
    })
    .catch((e)=>{
        res.status(500).send(e)
    });
})
`

//delete by id
routerTextToExport +=  `
router.delete('/api/delete/${tableName}/:id',(req,res)=>{
    model.${tableName}.destroy({
        where:{
            id:req.params.id
        }
    })
    .then((result)=>{
        res.status(200).send(result)
    })
    .catch((e)=>{
        res.status(500).send(e)
    });
})
`
routerTextToExport +=`
module.exports = router;
`
resolve(routerTextToExport)
})
}

exports.generateEntryFile = (table)=>{
return new Promise((resolve,reject)=>{
let textToExport = `///// This file generated by apiGenetor. /////`
textToExport += `
const express = require('express')
const app = express()
const PORT = 3000;

// For parsing application/json
app.use(express.json());
 
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// import and use all router
${generateImportRouter(table)}

app.listen(PORT,function(e){
    if(e) console.log(e)
    console.log("server listen on PORT ", PORT)
})
` 
resolve(textToExport);
})
}

exports.generateAuthFile = ()=>{
return new Promise((resolve,reject)=>{
let textToExport = `///// This file generated by apiGenerator. /////`
textToExport += `
exports.authenticate = (req,res,next)=>{
    ///// Check Authentication Here /////
    return next()
}
`
resolve(textToExport);
})
}

exports.generateIndexModelFile = ()=>{
return new Promise((resolve, reject) => {
let textToExport = `///// This File generate by apiGenerator. /////`
textToExport += `
const { Sequelize } = require('sequelize');
const initModels = require("./models/init-models")

// In a real app, you should keep the database connection URL as an environment variable.
// But for this example, we will just use a local SQLite database.
// const sequelize = new Sequelize(process.env.DB_CONNECTION_URL);
const db = process.env.DATABASE
const us = process.env.USER_NAME
const ps = process.env.PASSWORD
const host = process.env.HOST
const port = process.env.PORT
const sequelize = new Sequelize(db, us, ps, {
    host: host,
    port: port,
    // one of our supported dialects:
    // 'mysql', 'mariadb', 'postgres', 'mssql', 'sqlite', 'snowflake', 'db2' or 'ibmi'
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const models = initModels(sequelize);

// We export the sequelize connection instance to be used around our app.
module.exports = models;
`
resolve(textToExport);
});
}

function generateImportRouter(table){
    let dataToExport = ``
    table.forEach(tableName =>{
        dataToExport += `const ${tableName} = require('./router/${tableName}')\n`
    })
    table.forEach(tableName =>{
        dataToExport += `app.use(${tableName})\n`
    })
    return dataToExport;
}

function generateDataColumn(column){
    let dataToExport = `let dataToProcess = new Object();\n`
    column.forEach(columnName => {
        dataToExport += `   if(typeof(req.body.${columnName}) !== 'undefined') dataToProcess['${columnName}'] = req.body.${columnName};\n`
    });
    return dataToExport
}