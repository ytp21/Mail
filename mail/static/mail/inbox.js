document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit new email (POST Request)
  document.querySelector('#compose-form').addEventListener('submit', submit_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email(event, emailRecipients = "", emailSubject = "", emailBody = "") {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-content-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = emailRecipients;
  document.querySelector('#compose-subject').value = emailSubject;
  document.querySelector('#compose-body').value = emailBody;

  // Deactivate all of the nav-buttons
  document.querySelector('#inbox').classList.remove('active');
  document.querySelector('#sent').classList.remove('active');
  document.querySelector('#archived').classList.remove('active');

  // Activate compose-button
  document.querySelector('.compose-button').style.boxShadow = 'none';
  document.querySelector('.compose-button').style.color = 'white';
}

// Submit new email (POST Request)
function submit_email(event) {

  event.preventDefault();
  
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      const message = Object.values(result);

      if (result.error) {
        document.querySelector('#alert-msg').innerHTML = `<div class="alert alert-danger d-flex align-items-center alert-dismissable fade show" role="alert"><svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg><div>${message}</div><button type="button" class="btn-close" style="margin-left: auto; margin-right: 5px;" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
      } else {
        console.log("Error - Refer to function submit_email");
      }
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h4 class="mb-4">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h4>`;

  // Deactivate all of the nav-buttons and compose-button
  document.querySelector('#inbox').classList.remove('active');
  document.querySelector('#sent').classList.remove('active');
  document.querySelector('#archived').classList.remove('active');
  document.querySelector('.compose-button').style.boxShadow = '2px 1000px 1px #fff inset';
  document.querySelector('.compose-button').style.color = 'black';

  // Activate the selected nav-button
  if (String(mailbox) === 'inbox') {
    document.querySelector('#inbox').classList.add('active');
  } else if (String(mailbox) === 'sent') {
    document.querySelector('#sent').classList.add('active');
  } else if (String(mailbox) === 'archive') {
    document.querySelector('#archived').classList.add('active');
  };

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      console.log(emails);
      emails.forEach(email => mailbox_body(email, mailbox))
  });
}

// Display every mail in the selected mailbox view
function mailbox_body(email, mailbox) {

  const email_msg = document.createElement('div');
  email_msg.className = 'email-msg';
  let emailRecipient = `To: ${email.recipients}`;
  if (email.recipients.length > 1) {
    emailRecipient = `To: ${email.recipients.length} recipients`;
  }

  if (String(mailbox) === 'inbox' || String(mailbox) === 'archive') {
    email_msg.innerHTML = `<div>
                              <span class="email-person">${email.sender}</span>
                              <span class="email-subject">${email.subject}</span>
                              <span class="email-time">${email.timestamp}</span>
                            </div>`;
  } else if (String(mailbox) === 'sent') {
    email_msg.innerHTML = `<div>
                              <span class="email-person">${emailRecipient}</span>
                              <span class="email-subject">${email.subject}</span>
                              <span class="email-time">${email.timestamp}</span>
                            </div>`;
  };

  // Add bold font to unread email
  if (!email.read) {
    email_msg.style.fontWeight = 'bold';
    email_msg.style.backgroundColor = 'white';
  };

  // Add hover effect
  email_msg.addEventListener('mouseover', () => {
    email_msg.style.border = '1px solid #C0C0C0';
    email_msg.style.boxShadow = 'inset 0px -11px 6px -12px #C0C0C0';
  });
  email_msg.addEventListener('mouseout', () => {
    email_msg.style.border = '';
    email_msg.style.boxShadow = '';
  });

  // Show email context 
  email_msg.addEventListener('click', () => {
    // Set email as read 
    if (!email.read) {
      fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
      })
    }
    // Load email content onto the page
    email_content(email, mailbox)
  });

  // Append every email onto the emails-view
  document.querySelector('#emails-view').append(email_msg); 
}

// Display the content of the selected email msg
function email_content(email, mailbox) {

  // Hide other unrelated views and show email-content-view only
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content-view').style.display = 'block';

  // Reset HTML content inside of the email-content-view page
  document.querySelector('#email-content-view').innerHTML = '';

  // Create div for the content element
  const subject = document.createElement('div');
  const msg_details = document.createElement('div');
  const body = document.createElement('div');
  const reply_button = document.createElement('button');

  // Assign class to each of the content element
  subject.className = 'subject-msg my-3 px-5';
  msg_details.className = 'details-msg px-5 mb-5';
  body.className = 'px-5 mb-5';
  reply_button.className = 'btn btn-info ms-5 me-3';

  // Design of the content
  subject.innerHTML = email.subject;

  msg_details.innerHTML = `<div>
                              <span class="from-msg"><strong>From: ${email.sender}</strong></span>
                              <span class="time-msg">${email.timestamp}</span>
                          </div>
                          <div class="to-msg">
                            To: ${email.recipients}
                          </div>`;

  body.innerHTML = email.body.split("\n").join("<br />");

  // Design of the reply button
  reply_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-reply-fill mb-1 me-2" viewBox="0 0 16 16"><path d="M5.921 11.9 1.353 8.62a.719.719 0 0 1 0-1.238L5.921 4.1A.716.716 0 0 1 7 4.719V6c1.5 0 6 0 7 8-2.5-4.5-7-4-7-4v1.281c0 .56-.606.898-1.079.62z"/></svg>Reply';
  reply_button.addEventListener('click', (event) => {
    let emailRecipients = email.sender;
    let emailSubject = email.subject;
    const emailBody = `On ${email.timestamp} "${email.sender}" wrote:\n${email.body}\n---------------Message Separator---------------\n`;

    // Change emailRecipient value to recipient if mailbox = sent
    if (String(mailbox) === 'sent') {
      emailRecipients = email.recipients;
    }

    // Verify if the email subject has "Re: "
    if (!email.subject.startsWith("Re: ")) {
      emailSubject = `Re: ${email.subject}`;
    } 

    compose_email(event, emailRecipients, emailSubject, emailBody);
  });

  // Append the elements except for archive button into the email-content-view
  document.querySelector('#email-content-view').append(subject);
  document.querySelector('#email-content-view').append(msg_details);
  document.querySelector('#email-content-view').append(body);
  document.querySelector('#email-content-view').append(reply_button);

  // Design of the archive_button
  if (String(mailbox) === 'inbox') {
    const archive_button = document.createElement('button');
    archive_button.className = 'btn btn-warning';
    archive_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive mb-1 me-2" viewBox="0 0 16 16"><path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/></svg>Archive';
    archive_button.addEventListener('click', () => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })
      .then(response => {
        console.log(response.status)
        load_mailbox("inbox")
      })
    });
    document.querySelector('#email-content-view').append(archive_button);

  } else if (String(mailbox) === 'archive') {
    const archive_button = document.createElement('button');
    archive_button.className = 'btn btn-warning';
    archive_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive-fill mb-1 me-2" viewBox="0 0 16 16"><path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/></svg>Move to Inbox';
    archive_button.addEventListener('click', () => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      })
      .then(response => {
        console.log(response.status)
        load_mailbox("inbox")
      })
    });
    document.querySelector('#email-content-view').append(archive_button);
  };
}



