
async function gethistory() {
    const response = await fetch(serverurl);
    const history = await response.json();
    document.getElementById("messages").innerHTML = "";
    for (let m = history.messages.length - 9; m < history.messages.length; m++) {
        if (m >= 0) {
            document.getElementById("messages").innerHTML += `<div class="message">${history.messages[m]}</div>`
        }
    }
}
async function sendmessage() {


    if (document.getElementById("input").value != null && document.getElementById("input").value != "") {
        var currentdate = new Date();
        const message = {
            from: username,
            time: `${currentdate.getHours()}:${currentdate.getMinutes()}`,
            message: document.getElementById("input").value
        }
        document.getElementById("input").value = ""
        await fetch(serverurl, {
            method: "POST",
            body: JSON.stringify(message)
        })
    }
    await gethistory();
}