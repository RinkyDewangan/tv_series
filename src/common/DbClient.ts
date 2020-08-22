import { MongoClient, Db } from "mongodb";
const options = {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    reconnectTries: 30, // Retry up to 30 times
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
}

class DbClient {

    public db:any;

    public async connect() {
        try{
            this.db = await MongoClient.connect("mongodb://localhost:27017/tvSerials");
            console.log("Connected to db");
            return this.db;
        }
        catch (error) {
            console.log("Unable to connect to db");           
        }       
    }
}

export = new DbClient();