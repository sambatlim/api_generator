#! /usr/bin/env node
const chalk = require('chalk')
const yargs = require("yargs");
const fs = require('fs')
const template = require('./template');
const mysql = require('mysql2/promise');


const usage = chalk.keyword('violet')("\nUsage: apiGenerator -h <host>  -p <port> -u <username> --pw <password> --db <database> \n")
const options = yargs
    .usage(usage)
    .option("h", { alias: "host", describe: "Can be your database IP address", type: "string", demandOption: false })
    .option("p", { alias: "port", describe: "Port to your database", type: "string", demandOption: false })
    .option("u", { alias: "username", describe: "Database Username", type: "string", demandOption: false })
    .option("pw", { alias: "password", describe: "Database Password", type: "string", demandOption: false })
    .option("db", { alias: "database", describe: "Database name", type: "string", demandOption: false })
    .help(true)
    .argv;

const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const host = argv.h || argv.host;
const port = argv.p || argv.port;
const username = argv.u || argv.username;
const password = argv.pw || argv.password;
const database = argv.db || argv.database;
if (host == null || username == null || database == null) {
    yargs.showHelp();
    return;
}

let mysqlConnection, databaseConnectionProperties
if (password && port) {
    databaseConnectionProperties = { host: host, database: database, user: username, password: password, port: port, rowsAsArray: true }
} else if (password) {
    databaseConnectionProperties = { host: host, database: database, user: username, password: password, rowsAsArray: true }
} else if (port) {
    databaseConnectionProperties = { host: host, database: database, user: username, password: password, rowsAsArray: true }
}

async function main() {
    try {
        const dirRouter = './router';
        if (!fs.existsSync(dirRouter)) {
            fs.mkdirSync(dirRouter);
        }

        const dirModel = './model';
        if (!fs.existsSync(dirModel)) {
            fs.mkdirSync(dirModel);
        }

        let allTable = [];
        mysqlConnection = await mysql.createConnection(databaseConnectionProperties);
        const [allTables, fields] = await mysqlConnection.execute(`select table_name from information_schema.tables where table_schema = ?`,[database])
        allTables.forEach(eachTable => {
            allTable.push(eachTable[0])
        })
        let countFinishTable = 0;
        allTable.forEach(async tableName => {
            let allColumn = [];
            const [columnFromQuery, fields] = await mysqlConnection.execute("SHOW COLUMNS FROM `"+tableName+"`")
            columnFromQuery.forEach(eachColumn => {
                if (eachColumn[0] !== 'id') {
                    allColumn.push(eachColumn[0]);
                }
            })

            let fileContent = await template.generateRouter(tableName, allColumn);
            fs.writeFile(`${dirRouter}/${tableName}.js`, fileContent, function (err) {
                if (err) {
                    return console.log(err);
                }
                countFinishTable ++;
                if(countFinishTable == allTable.length){
                    return console.log(`🎉🎉 All finish. ctrl + c to finish`);
                }else{
                    return console.log(`Finish create CRUD API for ${tableName}.`);
                }
            });
        })

        let writeAppFile = await template.generateEntryFile(allTable)
        fs.writeFile(`app.js`, writeAppFile, function (err) {
            if (err) {
                return console.log(err);
            }
            return console.log(`Finish create app file.`);
        });

        let writeAuthFile = await template.generateAuthFile()
        fs.writeFile(`auth.js`, writeAuthFile, function (err) {
            if (err) {
                return console.log(err);
            }
            return console.log(`Finish create auth file.`);
        });

        let writeIndexModelFile = await template.generateIndexModelFile()
        fs.writeFile(`./model/index.js`, writeIndexModelFile, function (err) {
            if (err) {
                return console.log(err);
            }
            return console.log(`Finish create index model file.`);
        });
        
    } catch (e) {
        console.log(e)
        return;
    }

}
const mainExecution = main();
return mainExecution;






