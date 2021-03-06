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
// updated every time the client's connection state changes.
// '.info/connected' returns boolean, true if the client is connected and false if they are not.
var connectedRef = dB.ref(".info/connected");
// When the client's connection state changes...
connectedRef.on("value", function (snap) {
    // If they are connected..
    if (snap.val()) {
        // Add user to the connections list.
        var con = connectionsRef.push(true);
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
        connectionsRef.orderByKey().limitToFirst(1).on('child_added', function (data) {
            var userKey = data.key;
            var userValue = data.val;
            console.log('Connections: ' + userKey);
            playerOneKey = userKey;
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
//Polluting The Global Space with some variables
// Declares the tallies to 0 
var userName = '';
var wins = 0;
var losses = 0;
var ties = 0;
//limits number of players to two
var Num_Players = 2;
//Storing RPS value Player One
var userGuess = '';
//Storing RPS value Player One
var userGuessTwo = '';
var turn = 1;
var a = false;
var playerNumber = 1;
var playersObject = {};
var playerOneName = '';
var playerTwoName = '';
var getCurrentTurn = '';
var playerOneKey = '';
nameSelection();

function nameSelection() {
    // Update firebase with Player node containing Name, Choice, Wins and Losses
    $('#nameSubmit').on('click', function () {
        userName = $('#name').val().trim();
        $('#nameForm').addClass('hidden');
        dB.ref('players/').once("value", function (snap) {
            a = snap.hasChildren(); // if pushed data awill return true
            if (a === false) {
                playerNumber = 1;
                dB.ref('/players/' + playerNumber + '/').set({
                    loss: losses,
                    name: userName,
                    win: wins,
                    ties: ties
                });
                playerOneStatus();
            } else if (a === true) {
                playerNumber = 2;
                dB.ref('/players/' + playerNumber + '/').set({
                    loss: losses,
                    name: userName,
                    win: wins,
                    ties: ties
                });
                playerTwoStatus();
            }
        });
        return false;
    });
}

function getSnapOfPlayers() {
    dB.ref('players/').on('value', function (snap) {
        playersObject = snap.val();
        playerOneName = playersObject[1].name;
        playerTwoName = playersObject[2].name;
        $('#playerOneName').html('<b>' + playerOneName + '</b>');
        $('#playerTwoName').html('<b>' + playerTwoName + '</b>');
    });
}

function playerOneStatus() {
    if (getCurrentTurn === 1) {
        getSnapOfPlayers();
        $('.choice').removeClass('hidden');
        playGame();
    } else {
        $('#playerOneStatus').addClass('hidden');
        $('#loginMessage').html('<p>Hi ' + userName + '! You are Player 1</p>');
        $('#currentStatus').html('<p class="joining">Waiting On Player 2 to Join!</p>');
    }
}

function playerTwoStatus() {
    $('#loginMessage').html('<p>Hi ' + userName + '! You are Player 2</p>');
    $('#currentStatus').html('<p>Waiting on Player 1 To Choose!</p>');
    var gameTurn = 1;
    dB.ref().update({
        turn: gameTurn
    });
    getSnapOfPlayers();
    playGame();
}
dB.ref('turn/').on('value', function (snap) {
    getCurrentTurn = snap.val();
    if (getCurrentTurn === 1) {
        playerOneStatus();
    }
});

function playGame() {
    if (getCurrentTurn === 1) {
        $('#currentStatus').html('<p>Its Your Turn To Pick!</p>');
        $('.userSelection').on('click', function () {
            userGuess = $(this).text();
            console.log('user guess: ' + userGuess);
            $('.listchoices').addClass('hidden');
            dB.ref('players/1/').update({
                choice: userGuess
            });
            $('.choice').append('<img class=userSelection src=assets/images/' + userGuess + '.png>');
            dB.ref('turn/').update({
                turn: 2
            });
        });
    }
    if (getCurrentTurn === 2) {
        $('#playerTwoResults').removeClass('hidden');
        $('.choice2').removeClass('hidden');
        $('.userSelection2').on('click', function () {
            userGuessTwo = $(this).text();
            console.log('user guess 2: ' + userGuessTwo);
            $('.listchoices2').addClass('hidden');
            dB.ref('players/2/').update({
                choice: userGuess
            });
            $('.choice2').append('<img class=userSelection2 src=assets/images/' + userGuessTwo + '.png>');
        });
    }
    // Making sure the user chooses r, p, or s
    if ((userGuess == 'rock') || (userGuess == 'paper') || (userGuess == 'scissors')) {
        console.log('Game Selections Success!');
        dB.ref('players').on(child_added, function (snap) {
            var gameStatus = snap.val();
        });
        // Test to determine winner 
        if ((userGuess == 'rock') && (userGuessTwo == 'scissors')) {
            playerOneWin();
        } else if ((userGuess == 'rock') && (userGuessTwo == 'paper')) {
            playerTwoWin();
        } else if ((userGuess == 'scissors') && (userGuessTwo == 'rock')) {
            playerTwoWin();
        } else if ((userGuess == 'scissors') && (userGuessTwo == 'paper')) {
            playerOneWin();
        } else if ((userGuess == 'paper') && (userGuessTwo == 'rock')) {
            playerOneWin();
        } else if ((userGuess == 'paper') && (userGuessTwo == 'scissors')) {
            playerTwoWin();
        } else if (userGuess == oppGuess) {
            ties++;
        }
    }

    function playerOneWin() {
        dB.ref('players/1/').update({
            win: wins++
        });
        $('#winsOne').html('<p>' + gameStatus[1].win + '</p>');
        dB.ref('players/2/').update({
            loss: losses++
        });
        $('#lossTwo').html('<p>' + gameStatus[2].loss + '</p>');
    }

    function playerTwoWin() {
        dB.ref('players/2/').update({
            win: wins++
        });
        $('#winsTwo').html('<p>' + gameStatus[2].win + '</p>');
        dB.ref('players/1/').update({
            loss: losses++
        });
        $('#lossOne').html('<p>' + gameStatus[1].loss + '</p>');
    }
    // //SWITCH CASE EXAMPLE OF GAME LOGIC
    //     switch(userGuess) {
    //     case 'rock':
    //       switch(oppGuess) {
    //             case 'rock':
    //                 return 'draw';
    //             case 'paper':
    //                 return 'lose';
    //             case 'scissors':
    //                 return 'win';
    //         }
    //       break;
    //     case 'paper':
    //         switch(oppGuess) {
    //             case 'rock':
    //                 return 'win';
    //             case 'paper':
    //                 return 'draw';
    //             case 'scissors':
    //                 return 'lose';
    //         }
    //       break;
    //     case 'scissors':
    //         switch(oppGuess) {
    //             case 'rock':
    //                 return 'lose';
    //             case 'paper':
    //                 return 'win';
    //             case 'scissors':
    //                 return 'draw';
    //         }
    //         break;
    //     }
    //  }
}
//MESSAGING DESIGN
function displayMessage(key, name, text) {
    var div = $('#key');
    if (!div) {
        //Need to create template and stylings to display message
        div = container.firstChild;
        div.setAttribute('id', key);
        this.messageList.appendChild(div);
    }
    div.querySelector('.name').textContent = name;
    var messageElement = div.querySelector('.message');
}

function loadMessages() {
    // Reference to the /messages/ database path.
    messagesRef = firebase.database().ref('messages');
    // Make sure we remove all previous listeners.
    messagesRef.off();
    // Loads previous messages and listen for new ones.
    var setMessage = function (data) {
        var val = data.val();
        displayMessage(data.key, val.name, val.text);
    }.bind(this);
    messagesRef.limitToLast(8).on('child_added', displayMessage);
    messagesRef.limitToLast(8).on('child_changed', displayMessage);
}
// Saves a new message in FB
function saveMessage(e) {
    e.preventDefault();
    // Check that the user entered a message 
    if (this.messageInput.value) {
        // Add a new message entry to the FB. 
        this.messagesRef.push({
            name: currentUser.displayName,
            text: this.messageInput.value
        }).then(function () {
            //clear textfield
        }).catch(function (error) {
            console.error('Error writing message to DB', error);
        });
    }
}