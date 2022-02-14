const sidebar = document.querySelector("aside");
const darkOverlay = document.querySelector(".dark-overlay");
let username;
let messageVisibility = "Público";
let messageRecipient = "Todos";
let lastMessageRecipient;
let lastMessage = null
let primeirasMensagensPegas = false;

function openSidebar(){
    sidebar.classList.add("aside--slide");
    darkOverlay.classList.add("dark-overlay--active--front");
    darkOverlay.classList.add("dark-overlay--active");
    document.body.classList.add("messages--remove-vertical-scroll");
}

function closeSidebar(){
    sidebar.classList.remove("aside--slide");
    darkOverlay.classList.remove("dark-overlay--active");
    document.body.classList.remove("messages--remove-vertical-scroll");
    setTimeout(function (){
        if(!sidebar.classList.contains("aside--slide")){
            darkOverlay.classList.remove("dark-overlay--active--front");
        }
    }, 700);
}

function enterChat(){
    username = document.querySelector("#login").value;
    if(username === ""){
        alert("Por favor, informe o seu nome de usuário para entrar no chat!");
        return;
    }
    document.querySelector(".login-page input").classList.add("hidden");
    document.querySelector(".login-page button").classList.add("hidden");
    document.querySelector(".login-page .loading-gif").classList.remove("hidden");
    axios.post('https://mock-api.driven.com.br/api/v4/uol/participants', {
        name: username
      })
      .then(function (response) {
        setInterval(maintainServerConnection, 5000);
        getOnlineChatUsers();
      })
      .catch(function (error) {
        console.log(error);
        alert("Favor escolher outro nome pois este já está em uso!");
        document.querySelector(".login-page .loading-gif").classList.add("hidden");
        document.querySelector("#login").value = "";
        document.querySelector(".login-page input").classList.remove("hidden");
        document.querySelector(".login-page button").classList.remove("hidden");
      });
}

function hideLoginPage(){
    document.querySelector(".login-page").classList.add("login-page--hidden");
    setTimeout(function () {document.querySelector(".login-page").classList.add("hidden")}, 1000);
}

function maintainServerConnection(){
    axios.post("https://mock-api.driven.com.br/api/v4/uol/status", { name: username });
}

function getChatMessages(){
    let promisse = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
    promisse.then(renderChatMessages);
    setInterval(updateChatMessages, 3000);
}

function renderChatMessages(messages){
    let main = document.querySelector("main");
    let newMessages = [];
    if(lastMessage === null){
        newMessages = messages.data;
        newMessages.reverse();
    } else {
        for(let i = messages.data.length - 1; i >= 0; i--){
            if(lastMessage.from === messages.data[i].from &&
                lastMessage.to === messages.data[i].to &&
                lastMessage.text === messages.data[i].text &&
                lastMessage.type === messages.data[i].type &&
                lastMessage.time === messages.data[i].time){
                break;
            }
            newMessages.push(messages.data[i]);
        }
    }

    for(let i = newMessages.length - 1; i >= 0; i--){
        let isPrivateMessage = (newMessages[i].type === "private_message");
        let isUserSenderOrRecipient = (newMessages[i].to === username || newMessages[i].to ==="Todos" || newMessages[i].from === username)
        if(!isPrivateMessage || (isPrivateMessage && isUserSenderOrRecipient)){
            main.append(renderMessageHTMLFormat(newMessages[i]));
            main.lastChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if(newMessages[i].type === "status" && newMessages[i].text === "entra na sala..." && newMessages[i].from !== username && primeirasMensagensPegas) {
            
            newChatUser(newMessages[i].from);
        } else if (newMessages[i].type === "status" && newMessages[i].text === "sai da sala..." && primeirasMensagensPegas){
            removeChatUser(newMessages[i].from);
        }
    }

    primeirasMensagensPegas = true;

    if(newMessages.length !== 0){
        lastMessage = newMessages[0];
    }
    setTimeout(hideLoginPage, 1000);
}

function renderMessageHTMLFormat(message) {
    let div = document.createElement("div");
    div.classList.add("message");
    let pMessage = document.createElement("p");
    let spanMessageContent = document.createElement("span");
    
    let spanMessageTime = document.createElement("span");
    spanMessageTime.classList.add("message__time");
    spanMessageTime.innerHTML = "(" + message.time + ") ";
    let strongFrom = document.createElement("strong");
    strongFrom.innerHTML = message.from + " ";
    let strongTo = document.createElement("strong");
    strongTo.innerHTML = message.to + ": ";
    let messageText = message.text;

    switch(message.type){
        case "status":{
            spanMessageContent.append(strongFrom, messageText);
            pMessage.append(spanMessageTime, spanMessageContent);
            div.classList.add("message--status");
            break;
        }
        case "message":{
            spanMessageContent.append(strongFrom, "para ", strongTo, messageText);
            pMessage.append(spanMessageTime, spanMessageContent);
            break;
        }
        case "private_message":{
            spanMessageContent.append(strongFrom, "reservadamente para ", strongTo, messageText);
            pMessage.append(spanMessageTime, spanMessageContent);
            div.classList.add("message--DM");
            break;
        }
    }
    div.append(pMessage);

    div.setAttribute("data-identifier", "message");
    return div;
}

function updateChatMessages(){
    let promisse = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
    promisse.then(renderChatMessages);
}

function getOnlineChatUsers(){
    let promisse = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants");
    promisse.then(renderOnlineChatUsers);
}

function renderOnlineChatUsers(chatUsers){
    const contacts = document.querySelector(".contacts");
    contacts.innerHTML = renderChatUserHTMLFormat({name: "Todos"});
    contacts.querySelector("li .checkmark").classList.remove("hidden");
    for(let i = 0; i < chatUsers.data.length; i++){
        if(chatUsers.data[i].name !== username){
            contacts.innerHTML += renderChatUserHTMLFormat(chatUsers.data[i]);
        }
    }

    lastMessageRecipient = document.querySelector("aside ul li");
    getChatMessages();
}

function renderChatUserHTMLFormat(chatUser){
    return `<li onclick="setMessageRecipient(this)" data-identifier="participant"><div class="div-6-pixels"></div><ion-icon name="person-circle"></ion-icon><p>${chatUser.name}</p><img src="images/checkmark.png" alt="checkmark" class="checkmark hidden"></li>`; 
}

function setMessageRecipient(clickedRecipient) {
    if(clickedRecipient === lastMessageRecipient){
        return;
    }
    messageRecipient = clickedRecipient.querySelector("p").innerText;
    clickedRecipient.querySelector(".checkmark").classList.remove("hidden");
    lastMessageRecipient.querySelector(".checkmark").classList.add("hidden");
    lastMessageRecipient = clickedRecipient;

    if(messageRecipient === "Todos"){
        setMessageVisibility(document.querySelector("aside .visibility li:first-child"));
    }

    if (messageVisibility === "Público"){
        document.querySelector("footer p").innerText = ` Enviando para ${messageRecipient} (publicamente)`;
    } else {
        document.querySelector("footer p").innerText = ` Enviando para ${messageRecipient} (reservadamente)`;
    }
}

function setMessageVisibility(clickedVisibility) {
    if(clickedVisibility === document.querySelector("aside .visibility li:first-child")){
        messageVisibility = "Público";
        document.querySelector("aside .visibility li:last-child .checkmark").classList.add("hidden");
        document.querySelector("footer p").innerText = `Enviando para ${messageRecipient} (publicamente)`;
    }
    else {
        messageVisibility = "Reservadamente";
        document.querySelector("aside .visibility li:first-child .checkmark").classList.add("hidden");
        document.querySelector("footer p").innerText = `Enviando para ${messageRecipient} (reservadamente)`;
    }
    
    clickedVisibility.querySelector(".checkmark").classList.remove("hidden");
}

function sendMessage(){
    if(document.querySelector("#message-input").value === ""){
        return;
    }
    let message = {
        from: username,
        to: messageRecipient,
        text: document.querySelector("#message-input").value,
        type: "message"
    };
    if(messageVisibility === "Reservadamente"){
        message.type = "private_message";
    }
    document.querySelector("#message-input").value = "";
    const promisse = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", message);
    promisse.then(updateChatMessages);
    promisse.catch(function() {
        alert("Erro ao enviar mensagem ao servidor. Necessário recarregar página.");
        window.location.reload();
    });
    
}

function newChatUser(newChatUserName){

    let userList = document.querySelectorAll(".contacts li");
    for(let i = 0; i < userList.length; i++){
        if(userList[i].querySelector("p").innerText === newChatUserName){
            return;
        }
    }

    const contacts = document.querySelector(".contacts");
    let li = document.createElement("li");
    let ion = document.createElement("ion-icon");
    let p = document.createElement("p");
    let check = document.createElement("img");
    let div1 = document.createElement("div");
    
    div1.classList.add("div-6-pixels");

    ion.setAttribute("name", "person-circle");
    p.innerText = newChatUserName;
    check.setAttribute("src", "images/checkmark.png");
    check.classList.add("checkmark");
    check.classList.add("hidden");
    li.classList.add("message--slide");
    li.setAttribute("onclick", "setMessageRecipient(this)");
    li.setAttribute("data-identifier", "participant");

    li.append(div1, ion, p, check);
    for (let i = 1; i < userList.length; i++){
        if(newChatUserName.toLowerCase() < userList[i].querySelector("p").innerText.toLowerCase()){
            userList[i].before(li);
            break;
        }
    }
    setTimeout(removeMessageSlide, 250, li);
}

function removeMessageSlide(li){
    li.classList.remove("message--slide");
}

function removeChatUser(offlineChatUserName){
    let contacts = document.querySelectorAll("aside .contacts li");
    for(let i = 0; i < contacts.length; i++){
        if(contacts[i].querySelector("p").innerText === offlineChatUserName){
            contacts[i].classList.add("message--slide");
            contacts[i].setAttribute("onclick", "");
            setTimeout(function(){ contacts[i].remove() }, 1000);
            return;
        }
    }

}

document.querySelector("#login").addEventListener('keydown', function (e) {
    let keyPressed = e.key || e.keyCode;
    if(keyPressed === "Enter" || keyPressed === 13) {
        enterChat();
    }
});

document.querySelector("#message-input").addEventListener('keydown', function (e) {
    let keyPressed = e.key || e.keyCode;
    if(keyPressed === "Enter" || keyPressed === 13) {
        sendMessage();
    }
});