const Email = require('email-templates')
const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service:'Zoho',
    host: 'smpt.zoho.com',
    port: 587,
    secure: false,
    ignoreTLS: true,
    requireTLS: false,
    auth: {
        user: 'noreply@xpertusm.com',
        pass: 'xpertusm123.'
    }
})
 
function new_password(user_email, name, password) {
    const email = new Email({
        message: {
          from: 'noreply@xpertusm.com'
        },
        send: true,
        transport: transporter
      });
       
      email.send({
          template: 'restorePassword',
          message: {
            to: user_email
          },
          locals: {
            name: name,
            password: password
          }
        })
        .then(console.log)
        .catch(console.error);
}

module.exports = {
    new_password
}