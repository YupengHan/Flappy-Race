var sock = io();

document.getElementById('signUp').addEventListener('click', function () {
    var usernameInput = document.getElementById("username").value;
    var passwordInput = document.getElementById("password").value;
    var reEnterPasswordInput = document.getElementById("reEnterPassword").value;
    if (passwordInput != reEnterPasswordInput) {
        document.getElementById("demo").innerHTML = "Passwords doesn't match";
        return;
    }
    userAndpass = usernameInput + ':' + passwordInput;
    sock.emit('signUp', userAndpass);
    sock.on('signUp', function (x) {
        if(x == 'success'){
            document.getElementById("demo").innerHTML = "sign up success " + usernameInput;
        } else {
            document.getElementById("demo").innerHTML = "sign up failed, user " + usernameInput + 'exist';
        }
    });
});
