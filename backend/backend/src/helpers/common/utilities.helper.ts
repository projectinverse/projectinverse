import * as jwt from "jsonwebtoken";
import * as bcrypt from 'bcrypt';
// import AWS from "aws-sdk";
// import Hogan from "hogan.js";
// import path from "path";
// import fs from "fs";
// import { Client, Status, GeocodeResponse } from "@googlemaps/google-maps-services-js";

const THREE_WEEKS = 60 * 60 * 24 * 7 * 3;

class UtilitiesHelper {
    constructor() { }
    //generate jwt
    /**
     * @param  {object} jwtData
     * @returns Promise
     */
    public async generateJwt(jwtData: object): Promise<any> {
        const secret: any = process.env.JWTSECRET;
        try {
            return jwt.sign(jwtData, secret, {
                expiresIn: THREE_WEEKS,
            });

        } catch (error) {
            console.log('error', error);
            return error;
        }
    }
    //generate random string
    public randomString(length: number): string {
        let result = '';
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i += 1) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    //generate hash for password
    public async generateHash(password: any): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }
    //compare password hash
    public async compareHash(passwordtext: any, hash: any): Promise<boolean> {
        const saltRounds = 10;
        return await bcrypt.compare(passwordtext, hash);
    }
    //admin compare
    public async comparingHash(passwordtext: any, hash: any): Promise<boolean> {
        return await bcrypt.compare(passwordtext, hash);
    }
    //check for valid password
    public isValidPassword(password: string) {
        password = String(password);
        const length = password.length;
        const passUpper: string = password.toUpperCase();
        const passLower: string = password.toLowerCase();
        if (length > 7 && passUpper !== password && password !== passLower) {
            return true;
        } else {
            return false;
        }
    }
    //send Email using AWS SES
    // sendEmail(data: any) {
    //     const { email, subject, template, templateData } = data;
    //     // var body = fs.readFile("./EmailTemplate.html");
    //     const accessKeyId = process.env.EMAIL_ACCESS_KEY;
    //     const secretAccessKey = process.env.EMAIL_SECRET_ACCESS_KEY;

    //     let body: any = fs.readFileSync(
    //         // path.resolve(__dirname, "../templates/registration.html"),
    //         path.resolve(__dirname, `../../templates/${template}`),
    //         "utf8"
    //     );
    //     body = Hogan.compile(body, {
    //         delimiters: "<% %>"
    //     });
    //     body = body.render(templateData);
    //     // emailUtils.sendEmail(email, "Welcome to VeganNation!", body);

    //     AWS.config.update({
    //         accessKeyId,
    //         secretAccessKey,
    //         region: "us-east-1"
    //     });

    //     const ses = new AWS.SES();

    //     const params = {
    //         Destination: {
    //             CcAddresses: [],
    //             ToAddresses: [email]
    //         },
    //         Message: {
    //             Body: {
    //                 Html: {
    //                     Charset: "UTF-8",
    //                     Data: body
    //                 }
    //             },
    //             Subject: {
    //                 Charset: "UTF-8",
    //                 Data: subject
    //             }
    //         },
    //         Source: "VeganNation <info@vegannation.io>",
    //         ReplyToAddresses: ["info@vegannation.io"]
    //     };

    //     ses.sendEmail(params, (err: any, data: any) => {
    //         // If something goes wrong, print an error message.
    //         if (err) {
    //             console.log(err.message);
    //         } else {
    //             console.log("Email sent! Message ID: ", data.MessageId);
    //         }
    //     });
    // }

}

export default new UtilitiesHelper();