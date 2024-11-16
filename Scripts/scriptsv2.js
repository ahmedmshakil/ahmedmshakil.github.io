const form = document.querySelector("form");
const fullname = document.getElementById("name");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const subject = document.getElementById("subject");
const message = document.getElementById("message");

function sendEmail() {
  const bodyMessage = `Full Name: ${fullname.value}<br> Email: ${email.value}<br> Phone Number: ${phone.value} <br> Message: ${message.value}`;
// need to review, Email send not working 
  Email.send({
    Host: "smtp.elasticemail.com",
    Username: "ahmedmshakil1@gmail.com",
    Password: "5D96A83915GF596FFA1BFFB4C757D42DD4F17",
    To: "ahmedmshakil1@gmail.com",
    From: email.value,
    Subject: subject.value,
    Body: bodyMessage,
  }).then((message) => alert(message));
  form.reset();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  sendEmail();
});
