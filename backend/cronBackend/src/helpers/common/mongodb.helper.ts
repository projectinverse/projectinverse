import mongoose from 'mongoose';

class MongoHelper {
    private host: any = process.env.MONGO_HOSTNAME;
    private port: string = process.env.MONGO_PORT!;
    private userName: string = process.env.MONGO_USERNAME!;
    private pwd: string = process.env.MONGO_PASSWORD!;
    private db: string = process.env.MONGO_DATABASE!;
    private env: string = process.env.NODE_ENV!;

    constructor() {
        // this.connectMongoDB();
    }
    /**
     * connect Mongo DB
     */
    public async connectMongoDB() {
        this.env = process.env.NODE_ENV!;
        this.host = process.env.MONGO_HOSTNAME;
        this.port = process.env.MONGO_PORT!;
        this.userName = process.env.MONGO_USERNAME!;
        this.pwd = process.env.MONGO_PASSWORD!;
        this.db = process.env.MONGO_DATABASE!;

        let url = `mongodb://${this.host}:${this.port}/${this.db}?authSource=admin`;
        let options: any = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
            poolSize: 100
        };

        // if (this.env === 'stage') {
        //     url = `mongodb://${this.userName}:${this.pwd}@${this.host}:${this.port}/${this.db}?authSource=admin&replicaSet=s0&readPreference=secondaryPreferred&retryWrites=false`;
        //     options = {
        //         useNewUrlParser: true,
        //         useUnifiedTopology: true,
        //         useCreateIndex: true,
        //         useFindAndModify: false,
        //         poolSize: 100
        //     };
        // }

        // if (this.env === 'prod') {
        //     url = `mongodb://${this.userName}:${this.pwd}@${this.host}:${this.port}/${this.db}?authSource=admin&ssl=true&replicaSet=rs0&readPreference=primary&retryWrites=false`;
        //     options = {
        //         // sslValidate: true,
        //         // sslCA: ca,
        //         useNewUrlParser: true,
        //         useUnifiedTopology: true,
        //         useCreateIndex: true,
        //         useFindAndModify: false,
        //         poolSize: 100
        //     };
        // }

     
        try {
            const conn = await mongoose.connect(url,options);
            console.log('mongoDB: Connected Successfully.!!')
        } catch (error) {
            console.log(error);
            console.log('mongoDb: Failed To Connect.!!');
        }
        

        mongoose.set('debug', true);
    }
}

export default new MongoHelper();
