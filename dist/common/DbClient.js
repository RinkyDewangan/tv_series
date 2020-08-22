"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongodb_1 = require("mongodb");
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    reconnectTries: 30,
    reconnectInterval: 500,
    poolSize: 10,
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
};
class DbClient {
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.db = yield mongodb_1.MongoClient.connect("mongodb://localhost:27017/tvSerials");
                console.log("Connected to db");
                return this.db;
            }
            catch (error) {
                console.log("Unable to connect to db");
            }
        });
    }
}
module.exports = new DbClient();
//# sourceMappingURL=DbClient.js.map