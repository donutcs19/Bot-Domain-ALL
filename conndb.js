const mysql = require("mysql2");
const conn = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'domainsss'
});

conn.connect((err) => {
    if (err){
        console.log('Error connection to MySQL -> ',err)
        return;
    }
    console.log('MySQL success connection domainsss');
});

module.exports = conn;