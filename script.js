const sidebar = document.querySelector("aside");
const darkOverlay = document.querySelector(".dark-overlay");


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

function intializeServerConection(){
    axios.post('http://mock-api.driven.com.br/api/v4/uol/participants', {
        name: 'dhfksdhfsdk'
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
}

function getMessages(){
    let promisse = axios.get("http://mock-api.driven.com.br/api/v4/uol/messages");
    promisse.then(renderMessages);
}

function renderMessages(messages){
    console.log(messages.data);
}

getMessages();
intializeServerConection();