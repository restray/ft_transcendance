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
    
    channels.on('connect_error', err => handleErrors(err))
    channels.on('connect_failed', err => handleErrors(err))

    channels.on("connect", () => {
        console.info("Socket channels status is connected!")
    });

    channels.on('message', (info) => {
        console.log("message", info)
    })

    channels.on('join', (info) => {
        console.log("join", info)
    })
    channels.on('leave', (info) => {
        console.log("leave", info)
    })
    channels.on('action', (info) => {
        console.log("action", info)
    })

    channels.on('exception', (error) => {
        console.log(error)
    })

    document.getElementById("sendMessage").addEventListener("click", () => {
        channels.emit("message", {
            channel: document.getElementById("channel").value,
            message: document.getElementById("message").value
        }, (response) => {
            console.log(response); // ok
        });
    })
    
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
}

document.getElementById('login').addEventListener("click", (event) => {
    const BearerToken = document.getElementById('token').value;

    handleFriendsStatus(BearerToken);
    handleChannelsMessages(BearerToken);
});
