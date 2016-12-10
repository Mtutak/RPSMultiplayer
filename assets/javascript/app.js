console.log('connected to JS!');
// Initialize Firebase
var config = {
    apiKey: "AIzaSyAjqo8CtXgHy2Z0KrDoonNHiSDeyG3jMMg",
    authDomain: "rpsapp-2f4a0.firebaseapp.com",
    databaseURL: "https://rpsapp-2f4a0.firebaseio.com",
    storageBucket: "rpsapp-2f4a0.appspot.com",
    messagingSenderId: "399064718697"
};
firebase.initializeApp(config);
// Create a variable to reference the database.
var dB = firebase.database();
// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
var connectionsRef = dB.ref("/connections");
// '.info/connected' is a special location provided by Firebase that is updated every time
// the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = dB.ref(".info/connected");
// When the client's connection state changes...
connectedRef.on("value", function (snap) {
    // If they are connected..
    if (snap.val()) {
        // Add user to the connections list.
        var con = connectionsRef.push(true);
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
        connectionsRef.on('child_added', function (data) {
            var userKey = data.key;
            var userValue = data.val;
            console.log('Connections: ' + userKey);
        });
    }
    console.log('Is User Connected: ' + snap.val());
});
// When first loaded or when the connections list changes...
connectionsRef.on("value", function (snap) {
    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    $("#watchers").html(snap.numChildren());
});
// ROCK PAPER SCISSORS LOGIC
// Declares the tallies to 0 
var wins = 0;
var losses = 0;
var ties = 0;
var userGuess = '';
var oppChoices = ['rock', 'paper', 'scissors'];
nameSelection();
$('.userSelection').on('click', function () {
    userGuess = $(this).text();
    console.log('user guess: ' + userGuess);
    $('.listchoices').addClass('hidden');
    $('.choice').append('<img class=userSelection src=assets/images/' + userGuess + '.png>');
    // This sets the computer guess equal to the random.
    var oppGuess = oppChoices[Math.floor(Math.random() * oppChoices.length)];
    console.log('opponent random guess: ' + oppGuess);
    // Making sure the user chooses r, p, or s
    if ((userGuess == 'rock') || (userGuess == 'paper') || (userGuess == 'scissors')) {
        console.log('Game Selections Success!');
        // Test to determine winner 
        if ((userGuess == 'rock') && (oppGuess == 'scissors')) {
            wins++;
        } else if ((userGuess == 'rock') && (oppGuess == 'paper')) {
            losses++;
        } else if ((userGuess == 'scissors') && (oppGuess == 'rock')) {
            losses++;
        } else if ((userGuess == 'scissors') && (oppGuess == 'paper')) {
            wins++;
        } else if ((userGuess == 'paper') && (oppGuess == 'rock')) {
            wins++;
        } else if ((userGuess == 'paper') && (oppGuess == 'scissors')) {
            losses++;
        } else if (userGuess == oppGuess) {
            ties++;
        }
    }
});

function gameStart() {}

function nameSelection() {
    // Update firebase with Chat node, Player node containing Name, Choice, Wins and Losses
    $('#nameSubmit').on('click', function () {
        userName = $('#name').val().trim();
        dB.ref('/connections/' + userName + '/').push({
            username: userName
        });
        dB.ref('players/1/').set({
            loss: losses,
            name: userName,
            win: wins
        });
        $('#nameForm').addClass('hidden');
        $('#playerOneStatus').addClass('hidden');
        $('.choice').removeClass('hidden');
        $('#playerTwoResults').removeClass('hidden');
        return false;
    });
}
FriendlyChat.prototype.loadMessages = function () {
    // Reference to the /messages/ database path.
    messagesRef = firebase.database().ref('messages');
    // Make sure we remove all previous listeners.
    messagesRef.off();
    // Loads the last 12 messages and listen for new ones.
    var setMessage = function (data) {
        var val = data.val();
        this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
    }.bind(this);
    this.messagesRef.limitToLast(12).on('child_added', setMessage);
    this.messagesRef.limitToLast(12).on('child_changed', setMessage);
};