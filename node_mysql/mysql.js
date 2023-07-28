// const mysql = require('mysql2')

// const connection = mysql.createConnection({
//   host: 'localhost',
//   port: 3306,
//   user: 'root',
//   password: '123456',
//   database: 'practice'
// })

// connection.query(
//   'SELECT * FROM customers WHERE name LIKE ?',
//   ['李%'],
//   function(err, results, fields) {
//     console.log(results);
//     console.log(fields.map(item => item.name))
//   }
// )

// connection.execute('INSERT INTO customers (name) VALUES (?)', 
//     ['光'],
//     function(err, results, fields) {
//       console.log(err, results);
//       // console.log(fields.map(item => item.name))
//     }
// )

// connection.execute('UPDATE customers SET name=? WHERE name="光"', 
//     ['guang'],
//     function(err, results, fields) {
//       console.log(err, results);
//       // console.log(fields.map(item => item.name))
//     }
// )

// connection.execute('DELETE FROM customers WHERE name=?', 
//     ['guang'],
//     function(err, results, fields) {
//       console.log(err, results);
//     }
// )

const mysql = require('mysql2/promise');

// (async function() {

//     const connection = await mysql.createConnection({
//         host: 'localhost',
//         port: 3306,
//         user: 'root',
//         password: '123456',
//         database: 'practice'
//     });

//     const [results, fields] = await connection.query('SELECT * FROM customers');

//     console.log(results);
//     console.log(fields.map(item => item.name)); 

// })();

(async function() {
  const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'practice',
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10, 
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

  const [results] = await pool.query('select * from customers');
  console.log(results);
})();