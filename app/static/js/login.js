
$(function(){
// Initialize library
SE.init({
    // Parameters obtained by registering an app, these are specific to the SE
    //   documentation site
    clientId: 9429,
    key: 'Oi2fc61XpWFaTzCK9*vljw((',
    // Used for cross domain communication, it will be validated
    channelUrl: 'http://localhost/blank',
    // Called when all initialization is finished
    complete: function(data) {
        $('#login-button')
            .removeAttr('disabled')
            .text('Run Example With Version '+data.version);

    }
});

// Attach click handler to login button
$('#login-button').click(function() {

    // Make the authentication call, note that being in an onclick handler
    //   is important; most browsers will hide windows opened without a
    //   'click blessing'
    SE.authenticate({
        success: function(data) {
            sessionStorage.setItem("at", data.accessToken);
            for (s_network of data.networkUsers) {
              if( s_network.site_name === "Stack Overflow" ) {
                console.log("I'm stackoverflow")
                sessionStorage.setItem("uid", s_network.user_id);
                break
              }
            }
            console.log(data)
            window.location.href = "http://localhost/";
        },
        error: function(data) {
            alert('An error occurred:\n' + data.errorName + '\n' + data.errorMessage);
        },
        networkUsers: true
    });
});
});