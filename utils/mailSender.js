const mailjet = require("node-mailjet");

const transporter = mailjet.connect(
  "fe3152c5d2c7918a05ff71c6c86af527",
  "071870a03b93ef1a8cbac64deca3a137"
);


module.exports = function sendMail(userEmail, message, callback){
  const request = transporter.post("send").request({
    FromEmail: "vishnupanickers2@gmail.com",
    FromName: "Test-Validator",
    Subject: "Greetings from Visque (dev)",
    "Text-part":
      "Dear passenger, welcome to Mailjet! May the delivery force be with you!",
    "Html-part": message,
    Recipients: [{ Email: userEmail }],
  });
  request
  .then((result) => {
    console.log(result.body);
    callback();
  })
  .catch((err) => {
    callback("Cannot send Mail... Try Again Later")
  });

}
