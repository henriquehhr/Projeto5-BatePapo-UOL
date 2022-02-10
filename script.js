const sidebar = document.querySelector("aside");
const darkOverlay = document.querySelector(".dark-overlay");
let username;
let messageVisibility;
let messageRecipient = "Todos";
let lastMessageRecipient;

function openSidebar(){
    sidebar.classList.add("aside--slide");
    darkOverlay.classList.add("dark-overlay--active--front");
    darkOverlay.classList.add("dark-overlay--active");
    document.querySelector("main").classList.add("messages--remove-vertical-scroll");
}

function closeSidebar(){
    sidebar.classList.remove("aside--slide");
    darkOverlay.classList.remove("dark-overlay--active");
    document.querySelector("main").classList.remove("messages--remove-vertical-scroll");
    setTimeout(function (){
        if(!sidebar.classList.contains("aside--slide")){
            darkOverlay.classList.remove("dark-overlay--active--front");
        }
    }, 700);
}

function enterChat(){
    username = prompt("Qual o seu lindo nome?");
    axios.post('https://mock-api.driven.com.br/api/v4/uol/participants', {
        name: username
      })
      .then(function (response) {
        //console.log(response);
        setInterval(maintainServerConnection, 5000);
        getChatMessages();
        getOnlineChatUsers();
      })
      .catch(function (error) {
        console.log(error);
        enterChat();
      });
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
    //console.log(messages.data);
    let main = document.querySelector("main");
    main.innerHTML = "";
    for(let i = 0; i < messages.data.length; i++){
        main.append(renderMessageHTMLFormat(messages.data[i]));
    }
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
        default: console.log("deu erro");
    }

    div.append(pMessage);
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
    contacts.innerHTML = `
    <li onclick="setMessageRecipient(this)">
        <ion-icon name="people"></ion-icon>
        <p>Todos</p>
        <ion-icon name="checkmark-sharp" class="checkmark"></ion-icon>                                
    </li>`;
    for(let i = 0; i < chatUsers.data.length; i++){
        if(chatUsers.data[i].name !== username){
            contacts.innerHTML += renderChatUserHTMLFormat(chatUsers.data[i]);
        }
    }

    lastMessageRecipient = document.querySelector("aside ul li");
}

function renderChatUserHTMLFormat(chatUser){
    return `
    <li onclick="setMessageRecipient(this)">
        <ion-icon name="person-circle"></ion-icon>
        <p>${chatUser.name}</p>
        <ion-icon name="checkmark-sharp" class="checkmark hidden"></ion-icon>                                
    </li>`; 
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
}

function setMessageVisibility(clickedVisibility) {
    if(clickedVisibility === document.querySelector("aside .visibility li:first-child")){
        messageVisibility = "Público";
        document.querySelector("aside .visibility li:last-child .checkmark").classList.add("hidden");
    }
    else {
        messageVisibility = "Reservadamente";
        document.querySelector("aside .visibility li:first-child .checkmark").classList.add("hidden");
    }
    
    clickedVisibility.querySelector(".checkmark").classList.remove("hidden");
}

function sendMessage(){
    if(document.querySelector("input").value === ""){
        return;
    }
    let message = {
        from: username,
        to: messageRecipient,
        text: document.querySelector("input").value,
        type: "message"
    };
    if(messageVisibility === "Reservadamente"){
        message.type = "private_message";
    }
    console.log(message);
    document.querySelector("input").value = "";
    let promisse = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", message);
    promisse.then(updateChatMessages);
    promisse.catch(function() {
        alert("Erro ao enviar mensagem ao servidor. Necessário recarregar página.");
        window.location.reload();
    });
    
}

document.querySelector("input").addEventListener('keydown', function (e) {
    if(e.keyCode==13) {
        sendMessage();
    }
});

enterChat();