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