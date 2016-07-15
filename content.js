// find the relevant elements
var password = document.querySelector('input[type=password]');
var loginform = password.form;
if (!loginform) {
    loginform = password.closest("fieldset");
}
var username = loginform.querySelector('input[type=text], input[type=email]')
var sub = loginform.querySelector('input[type=submit], button[type=submit], button[type=button]');

/*
// for debugging purposes, erase when done
alert(password.id);
alert(loginform.id);
alert(username.id);
alert(sub.id);
*/

// data is saved in 000003.txt at
// C:\Users\mjkim\AppData\Local\Google\Chrome\User Data\Default\Local Extension Settings\eilllankfpchokjofpgnhjbfppmhjckh
function saveLoginHistory() {

    // store values into separate variables
    var usernameValue = username.value;
    var passwordValue = password.value;

/*
    // for debugging purposes, erase when done
    alert(sub.id);
    alert(username.id + ": " + usernameValue);
    alert(password.id + ": " + passwordValue);
    alert(loginform.id);
*/

    // store each variable into corresponding arrays
    chrome.storage.local.get({urls: []}, function (result) {
        var urls = result.urls;
        urls.push(document.domain);
        chrome.storage.local.set({ urls: urls });

    });
    chrome.storage.local.get({usernames: []}, function (result) {
        var usernames = result.usernames;
        usernames.push(usernameValue);
        chrome.storage.local.set({ usernames: usernames });
    });
    chrome.storage.local.get({passwords: []}, function (result) {
        var passwords = result.passwords;
        passwords.push(passwordValue);
        chrome.storage.local.set({ passwords: passwords });
    });
    chrome.storage.local.get({times: []}, function (result) {
        var times = result.times;
        times.push(new Date().toString());
        chrome.storage.local.set({ times: times });
    });
    // resend message with correct loginAttempt value
    sendMessage(true, true);
}

function sendMessage(submitClicked, submitExists) {
    chrome.runtime.sendMessage({domain: document.domain, isLoginAttempt: submitClicked}, function(response) {
        console.log("Previous domain: " + response.previousDomain);
        console.log("Current domain: " + document.domain);
        console.log("Previous page was login attempt: " + response.isLoginAttempt);
        console.log("Current page was login attempt: " + submitClicked);
        console.log("Current page was login page: " + submitExists);

        if (response.previousDomain == document.domain && response.isLoginAttempt == true && submitClicked == false && submitExists == true) {
            console.log("!!!!FAILED LOGIN ATTEMPT!!!!");
        }
    });
}

// store the current conditions to background.js (the else statement is unncessary because javascript error occurs at line 3)
if (password)
    sendMessage(false, true);
else
    sendMessage(false, false);

// if submit button is clicked call saveLoginHistory function
sub.onclick = saveLoginHistory;

// HOW DO I DETERMINE WHETHER USER LOGGED IN SUCCESSFULLY?
// IF THE PREVIOUS PAGE HAD A PASSWORD FIELD AND THE CURRENT PAGE ALSO HAS A PASSWORD FIELD,
// YOU CAN ASSUME THAT THE USER WAS UNSUCCESFUL IN LOGGING IN
// OR CHECK THAT THE PASSWORD FIELD AND THE USERNAME FIELD HAVE THE SAME ID'S
// IN BOTH THE PREVIOUS AND THE CURRENT PAGE

// content.js: when onclick is fired, tell background.js (onclick, domain)
// content.js: when a page is loaded, check if there is a password field and ask background.js
// background.js: if request message is received, send the most recent domain address (where onclick occured)
// content.js: when the message is received, if the domain address is different, break
// content.js:      else if the domain address is same, login attempt has failed
