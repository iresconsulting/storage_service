import mysql from 'mysql'
import Logger from '~/src/utils/logger';

const env = process.env

export default function initMysql() {
  try {
    const connection = mysql.createConnection({
      host     :  env.DB_HOST || 'localhost',
      user     :  env.DB_USER,
      password :  env.DB_PASSWORD,
      database :  env.DB_DATABASE,
    });
  
    connection.connect();
    
    connection.query('SELECT NOW()', function (error: any, res: any, fields: any) {
      if (error) {
        throw error;
      }
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `SELECT NOW(): ${JSON.stringify(res[0].solution)}` })
    })
  } catch (err) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `connection error: ${String(err)}` })
  }
}
