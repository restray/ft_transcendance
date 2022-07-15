handleErrors = (err) => {
    console.error(err);
}

handleFriendsStatus = (BearerToken) => {
    const friends = io("ws://localhost:3000/friends", { auth: { token: BearerToken }})

    friends.on('connect_error', err => handleErrors(err))
    friends.on('connect_failed', err => handleErrors(err))

    friends.on("connect", () => {
        console.info("Socket friends status is connected!")
    });

    friends.on('status', (login, status) => {
        console.log(login, status)
    })

    friends.on('exception', (error) => {
        console.log(error)
    })

    document.getElementById("updateStatus").addEventListener("click", () => {
        friends.emit("status", document.getElementById("status").value);
    })
}

handleChannelsMessages = (BearerToken) => {
    const channels = io("ws://localhost:3000/channels", { auth: { token: BearerToken }})
    
    channels.on("connect", () => {
        console.info("Socket channels status is connected!")
    });
    channels.on('connect_error', err => handleErrors(err))
    channels.on('connect_failed', err => handleErrors(err))

    // A message has been sent on a channel where i am
    channels.on('message', (info) => {
        console.log("message", info)
    })

    // An user has join a channel where i am
    channels.on('join', (info) => {
        console.log("join", info)
    })
    // An user leave join a channel where i am
    channels.on('leave', (info) => {
        console.log("leave", info)
    })
    // An user has perform an action in a channel where i am
    channels.on('action', (info) => {
        console.log("action", info)
    })

    // Receive dm message
    channels.on('dm_message', (info) => {
        console.log(info);
    })

    // Any Exception happening on "channels" socket
    channels.on('exception', (error) => {
        console.log(error)
    })
    
    // Send a message
    document.getElementById("sendMessage").addEventListener("click", () => {
        channels.emit("message", {
            channel: document.getElementById("channel").value,
            message: document.getElementById("message").value
        }, (response) => {
            console.log(response); // ok
        });
    })
    
    // Join a channel
    document.getElementById("joinChannel").addEventListener("click", () => {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${BearerToken}`)

        fetch(`http://localhost:3000/channels/${document.getElementById("channel").value}/join`, {
            method: "POST",
            headers: headers
        }).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.error(error);
        })
    })
    
    // Leave a channel
    document.getElementById("leaveChannel").addEventListener("click", () => {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${BearerToken}`)

        fetch(`http://localhost:3000/channels/${document.getElementById("channel").value}/leave`, {
            method: "DELETE",
            headers: headers
        }).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.error(error);
        })
    })

    // Create a DM Channel
    document.getElementById("createDmChannel").addEventListener("click", () => {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${BearerToken}`)

        fetch(`http://localhost:3000/dm/${document.getElementById("dmChannel").value}/`, {
            method: "POST",
            headers: headers
        }).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.error(error);
        })
    })
    
    document.getElementById("sendDmMessage").addEventListener("click", () => {
        channels.emit("dm_message", {
            user: document.getElementById("dmChannel").value,
            message: document.getElementById("dmMessage").value
        }, (response) => {
            console.log(response); // ok
        });
    })
    
    
}

handleGame = (BearerToken) => {
    let game;

    document.getElementById("joinGame").addEventListener("click", (e) => {
        game = io("ws://localhost:3000/games", { auth: { token: BearerToken }});
    
        game.on("connect", () => {
            console.info("Socket game is connected!");
            document.getElementById("gameStatus").innerHTML = "Waiting";
            game.emit("new", {match_making: "true"}, (game) => {
                console.log(game);
            });
        });
        game.on('connect_error', err => handleErrors(err))
        game.on('connect_failed', err => handleErrors(err))

        game.on("disconnect", () => {
            console.info("Socket game is disconnected!");
            document.getElementById("gameStatus").innerHTML = "Disconnected";
        });

        game.on("join", (info) => {
            console.log("join", info);
            if (info.game.players["left"])
                document.getElementById("gamePlayer1").innerHTML = info.game.players["left"].connected.name;
            if (info.game.players["right"])
                document.getElementById("gamePlayer2").innerHTML = info.game.players["right"].connected.name;
            let status = info.game.status + (info.game.paused ? " (paused)" : "");
            document.getElementById("gameStatus").innerHTML = status;
        })

        game.on("pause", (game) => {
            let status = game.status + (game.paused ? " (paused)" : "");
            document.getElementById("gameStatus").innerHTML = status;
        })
    });

    document.getElementById("disconnectGame").addEventListener("click", (e) => {
        game.disconnect();
        game = null;
    })

    // createGame
    // privateGameId
    // joinPrivateGame
    // gamePlayer1
    // gamePlayer2
    // gameStatus
}

document.getElementById('login').addEventListener("click", (event) => {
    const BearerToken = document.getElementById('token').value;

    handleFriendsStatus(BearerToken);
    handleChannelsMessages(BearerToken);
    handleGame(BearerToken);
});
