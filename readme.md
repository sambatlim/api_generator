
# API GENERATOR

This package will generate CRUD API file for your provided database.Before using this package make sure you understand what it does.

### Statement of Problem
It is time consuming when we write API code. It may take days to write all the fields for each table in your database.
So this package will help write it for you.This package require **[express](https://expressjs.com/)**, **[sequelize](https://sequelize.org/)** and **[sequelize-auto](https://github.com/sequelize/sequelize-auto)** to generate `models` directory in `./model`.

### Prerequisites
To make the API work please make sure you have generate `models` directory using **[sequelize-auto](https://github.com/sequelize/sequelize-auto)** into `./model` directory generate by script.

## Install
```

npm install api_generator

```

```
// currently support mysql database

Usage: apiGenerator -h <host>  -p <port> -u <username> --pw <password> --db <database>

```

```

Options:
      --version         Show version number                            [boolean]
  -h, --host            Can be your database IP address                 [string]
  -p, --port            Port to your database                           [string]
  -u, --username        Database Username                               [string]
      --pw, --password  Database Password                               [string]
      --db, --database  Database name                                   [string]
      --help            Show help                                      [boolean]

```

It will produce a file `app.js` in your root directory so make sure you backup your app.js file before running it.
The file will looks like this:

```
const express = require('express')
const app = express()
const PORT = 3000;

app.use(express.json());
 
app.use(express.urlencoded({ extended: true }));

const [table name] = require('./router/[Your table name]')
app.use([table name])

app.listen(PORT,function(e){
    if(e) console.log(e)
    console.log("server listen on PORT ", PORT)
})

```

It will produce a file `auth.js` in your root directory. This file is to handle all the authentication for your API. The file look like this:
```
exports.authenticate = (req,res,next)=>{
    ///// Check Authentication Here /////
    return next()
}

```

It will produce a directory call `./router/[table name].js`. The file look like this:

```
const express = require('express')
const router = express.Router()
const model = require('../model/index')
const authentication = require('../auth')
router.use(authentication.authenticate)

    
router.post('/api/insert/[table name]',(req,res)=>{
    let dataToProcess = new Object();
   if(req.body.[column_name]) dataToProcess['[column_name]'] = req.body.[column_name];

    model.[table name].create(
        dataToProcess
    )
    .then((result)=>{
        res.status(200).send(result)
    })
    .catch((e)=>{
        res.status(500).send(e)
    });
})

router.get('/api/get_all/[table name]',(req,res)=>{
    model.[table name].findAll()
    .then((result)=>{
        res.status(200).send(result)
    })
    .catch((e)=>{
        res.status(500).send(e)
    });
})

router.get('/api/get/[table name]/:id',(req,res)=>{
    model.[table name].findAll({
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

router.patch('/api/update/[table name]/:id',(req,res)=>{
    let dataToProcess = new Object();
   if(req.body.[column_name]) dataToProcess['[column_name]'] = req.body.[column_name];

    model.[table name].update({
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

router.delete('/api/delete/[table name]/:id',(req,res)=>{
    model.[table name].destroy({
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

module.exports = router;

```

It will produce a directory call `./model/index.js`. The file look like this:

```
const { Sequelize } = require('sequelize');
const initModels = require("./models/init-models")
// make sure you have set up your process.env
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
    // set up connection pool
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

```

## Authors

* **Sambat Lim** - *github profile* - [https://github.com/sambatlim](https://github.com/sambatlim)


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Reference

* [https://expressjs.com/](https://expressjs.com/)
* [https://github.com/sequelize/sequelize-auto](https://github.com/sequelize/sequelize-auto)
