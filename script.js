const sidebar = document.querySelector("aside");
const darkOverlay = document.querySelector(".dark-overlay");
let username;

function openSidebar(){
    sidebar.classList.add("aside--slide");
    darkOverlay.classList.add("dark-overlay--active--front");
    darkOverlay.classList.add("dark-overlay--active");
}

function closeSidebar(){
    sidebar.classList.remove("aside--slide");
    darkOverlay.classList.remove("dark-overlay--active");
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
        console.log(response);
        setInterval(maintainServerConnection, 5000);
        getChatMessages();
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
}

function renderChatMessages(messages){
    let main = document.querySelector("main");
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

enterChat();