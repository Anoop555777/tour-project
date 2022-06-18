const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = 'Anoop Singh <ajbsiht99@gmail.com>';
  }

  newTransport() {
    return nodemailer.createTransport({
      service: 'Gmail',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      // secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //render html
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstname,
      url: this.url,
      subject,
    });

    //define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);
    //create a transport and send email to
  }

  async sendWelcome() {
    await this.send('welcome', `Welcome to tour family ${this.firstname}`);
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'your password reset token valid for 10 min only'
    );
  }
};
