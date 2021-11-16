import * as ejs from "ejs";
import sgMail from "@sendgrid/mail";

class EmailHelper {
  sendgridApiKey = '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';
  sendgridFrom = 'nitesh.thakur@antiersolutions.com';
  sendgridName = 'Safe Chain';

  constructor() {
    sgMail.setApiKey(this.sendgridApiKey);
  }
  /**
   * send confirmation email
   * @param  {any} data
   */
  public async sendEmail(data: any) {
    try {
      const html = await ejs
        .renderFile(__dirname + "/../../templates/confirmation.html", {
          email: data.email,
          password: data.password
        })
        .then((data: any) => {
          return data;
        })
        .catch((error: any) => console.log(error));
      const msg = {
        to: data.email,
        from: {
          email: this.sendgridFrom,
          name: this.sendgridName,
        },
        subject: "Welcome To S4FEChain - New Registration",
        text: "S4FEChain",
        html: html,
      };
      const r: any = await sgMail.send(msg);
      console.log('email send', r.statusCode);
    } catch (error) {
      return error;
    }
  }
  /**
   * send Contact us email
   * @param  {any} data
   * @returns Promise
   */
  public async contactUs(data: any): Promise<any> {
    try {
      const html = await ejs
        .renderFile(__dirname + "/../../templates/contactus.html", {
          email: data.email,
          message: data.message
        })
        .then((data: any) => {
          return data;
        })
        .catch((error: any) => console.log(error));

      const msg = {
        to: this.sendgridFrom,
        from: {
          email: this.sendgridFrom,//data.email
          name: this.sendgridName,
        },
        subject: "User Request - " + data.subject,
        text: "S4FEChain",
        html,
      };
      const r: any = await sgMail.send(msg);
      console.log('email send', r.statusCode);
      return true;
    } catch (error) {
      return error;
    }
  }
}

export default new EmailHelper();
