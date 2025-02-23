const dbConfig = {
  mysql: {
    host: 'localhost',
    user: 'root',
    port: 3326,
    password: '123456',
    database: 'wuye',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
};

module.exports = dbConfig; 