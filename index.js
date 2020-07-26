var nodemailer = require('nodemailer');
var EmailTemplate = require('email-templates');


module.exports = function (options) {
    var nodemailerData  = {}
    if(options.service == "SMTP")
    {
         nodemailerData = {
            host: options.host,
            port: options.port,
            secure: options.secure,
            auth: {
                user: options.email, // Your email id
                pass: options.password // Your password }
            }
        }
    }
    else{
        
         nodemailerData =   {
            service: options.service,
            auth: {
                user: options.email, // Your email id
                pass: options.password // Your password }
            }
        };
    }
    var transporter = nodemailer.createTransport(nodemailerData);


   
    var sendVerificationEmail = function(data){

        renderTemplate(data,"verificationEmail")
    }
    var sendPasswordResetEmail = function(data){

        renderTemplate(data,"passwordResetEmail")
    }
    function renderTemplate(data,templateType)
    {
        var email = new EmailTemplate();
        let {  link, appName, user} = data
        email.config.views.options.extension = "hbs"
        var locals = {
            email:user.get("email") || user.get("username"),
            link,
            name:  user.get("name"),
            appName,
            
          };   
         
            htmlPath = options.templates[templateType].pathHtml
            textPath = options.templates[templateType].pathPlainText
            subject=  options.templates[templateType].subject
        
          Promise.all([
email.render(htmlPath, locals),
email.render(textPath, locals)
])
.then(([ html, text ]) => {
console.log('html', html);
console.log('text', text);
sendMail({
    to: user.get("email") || user.get("username"),
    subject, // Subject line
    text, //, // plaintext body
    html
  });

})
.catch(console.error);
    }

    var sendMail = function (mail) {

        return new Promise(function (resolve, reject) {

            var mailOptions = {
                from: options.from, // sender address
                to: [mail.to], // list of receivers
                subject: mail.subject, // Subject line
                text:mail.text, //, // plaintext body
                html:mail.html   
            };
        
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log('Message sent: ' + info.response);
                    resolve(info);
                };
            });
           


        });
    };


    return {
        sendMail: sendMail,
        sendVerificationEmail,
        sendPasswordResetEmail
    }
};

