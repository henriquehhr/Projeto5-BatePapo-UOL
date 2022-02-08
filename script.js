
function openSidebar(){
    document.querySelector("aside").classList.add("aside--slide");
    document.querySelector(".dark-overlay").classList.add("dark-overlay--active");
}

function closeSidebar(){
    document.querySelector("aside").classList.remove("aside--slide");
    document.querySelector(".dark-overlay").classList.remove("dark-overlay--active");
}