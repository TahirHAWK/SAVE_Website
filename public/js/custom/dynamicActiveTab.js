// here the active tab is detected and dynamically assigned according to addressbar route

// converting the web address from the addressbar into an array using split method and determining its size
let addressbarContents = window.location.href.split("/")
let addressbarSize = addressbarContents.length
// now reading the address route to determine which route we are in
let routeName = addressbarContents[addressbarSize-1].toLowerCase()
// as the home route is empty, we have to make sure of it doesn't cause any problems
    if(routeName == ''){
        routeName = 'home'
    }
// find out the number of existing anchor tags inside the header or nav
let allAnchorInsideNav = document.getElementById('header').getElementsByTagName('a')
let numberOfAnchorTags = allAnchorInsideNav.length


// now lets compare the tags innerHTML with the route name
    for(i = 0; i< numberOfAnchorTags; i++){
        // finding the routeName in between the anchor tags inside the nav
        if(allAnchorInsideNav[i].innerHTML.toLowerCase().includes(routeName)){
        // here we will dynamically assign the active class with the parent of routeName
        allAnchorInsideNav[i].parentElement.className = 'active'
        }
    }





