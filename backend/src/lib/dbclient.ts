import { Request, Response, NextFunction } from 'express'
import assert = require('assert')
import { MongoClient } from 'mongodb'

export interface DbCredentials {
  host: string;
  port: string;
  user: string;
  pw: string;
  name: string;
}

export interface EnhancedRequest extends Request {
  dbClient: DbClient;
}

export class DbClient {

  dbCredentials: DbCredentials
  mongoClient: MongoClient

  constructor(dbCredentials: DbCredentials) {
    this.dbCredentials = dbCredentials
  }

  public async initMongoClient() {
    console.log('Opening DB connection')
    const url = `mongodb://${this.dbCredentials.user}:${this.dbCredentials.pw}@` +
      `${this.dbCredentials.host}:${this.dbCredentials.port}/${this.dbCredentials.name}`
    this.mongoClient = await MongoClient.connect(url, { useUnifiedTopology: true })
    console.log('DB connection open')
  }

  static async closeDbConnection(req: EnhancedRequest, res: Response, next: NextFunction) {

    console.log('Closing DB connection')
    await req.dbClient.mongoClient.close()
    console.log('DB connection closed')
    next()
  }

  static async openDbConnection(req: EnhancedRequest, res: Response, next: NextFunction) {
    try {
      assert(process.env.db_host, 'db_host missing in .env');
      assert(process.env.db_port, 'db_port missing in .env');
      assert(process.env.db_user, 'db_user missing in .env');
      assert(process.env.db_pw, 'db_pw missing in .env');
      assert(process.env.db_name, 'db_name missing in .env');
    } catch (e) {
      throw new Error(e.message);
    }

    req.dbClient = new DbClient({
      host: process.env.db_host,
      port: process.env.db_port,
      user: process.env.db_user,
      pw: process.env.db_pw,
      name: process.env.db_name,
    })
    try {
      await req.dbClient.initMongoClient();
    } catch (e) {
      res.json(e);
    }
    next()
  }
}
