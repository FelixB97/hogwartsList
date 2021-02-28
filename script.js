"use strict";

window.addEventListener("DOMContentLoaded", init);

function defineGlobalVariables() {
    //global arrays
    window.allStudentsUncleaned = [];
    window.cleanStudentData = [];
    window.filteredStudents = [];
    window.expelledStudents = [];
    window.bloodList = [];
    window.prefectStudents = [];
    
    //togglehandlers
    window.firstNameSortstatus = false;
    window.middleNameSortstatus = false;
    window.lastNameSortstatus = false;
    window.genderSortstatus = false;
    window.houseSortstatus = false;
    
    //global hack check
    window.hacked = false;

}

let globalObject; //global handler for single objects

async function init() {
    console.log("site loaded");
    defineGlobalVariables();
    document.querySelector("#searchField").value = "";
    document.querySelector("#houses_select").value = "starter";// sets default value of house filter
    await loadJSON();
    
    cleanListData(allStudentsUncleaned);
    displayStudentsList(cleanStudentData);
    filteredStudents = cleanStudentData;

    addFilterEvents();
    addSortingEvents();

    document.querySelector("#closeSingle").addEventListener("click", closeSingle);
    document.querySelector("#hackingButton").addEventListener("click",hackTheSystem);
    
    
}

async function loadJSON() {
    const JSONData = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
    allStudentsUncleaned = await JSONData.json();
    
    const bloodJSON = await fetch("https://petlatkea.dk/2021/hogwarts/families.json");
    bloodList = await bloodJSON.json();
}

function cleanListData(array) {
    console.log("cleaning data");
    array.forEach( student => {
        
        const names = nameSplitter(student.fullname);

        const houseAndGender = houseAndGenderCaseCorrector(student);
    
        const newStudent = {
            firstName       : names.firstName,
            middleName      : names.middleName,
            lastName        : names.lastName,
            gender          : houseAndGender.gender,
            house           : houseAndGender.house,
            blood           : "",
            prefect         : false,
            inquisitorial   : false,
            expelled        : false
          };
          //determines if student is pure blood half blood or muggle sets value of blood
          if (bloodList.pure.includes(newStudent.lastName) == true) {
            newStudent.blood = "Pure-Blood";
      }
          
          if (bloodList.half.includes(newStudent.lastName) == true) {
                newStudent.blood = "Half-Blood";
          } 
          
          if (newStudent.blood == "") {
                newStudent.blood = "Muggle";
          }

        cleanStudentData.push(newStudent);

    })
    return cleanStudentData;
}

function buildList() {

    let filteredList = filterHouses();

    if (document.querySelector("#searchField").value == "") {
        displayStudentsList(filteredList);
    }

    else {
        displayStudentsList(filteredList.filter(isSearch));
    }
}

function displayStudentsList(array) {

    const templatePointer = document.querySelector(".listTemplate");
    const sectionPointer = document.querySelector(".listGrid");
    sectionPointer.innerHTML = "";
    // console.log("list length: " + array.length);
    displayStudentStats(array);
    
    array.forEach( student => {
        
        const klon = templatePointer.cloneNode(true).content;

        klon.querySelector(".firstName p").innerHTML = student.firstName;
        klon.querySelector(".middleName p").innerHTML = student.middleName;
        klon.querySelector(".lastName p").innerHTML = student.lastName;
        klon.querySelector(".gender p").innerHTML = student.gender;
        klon.querySelector(".house p").innerHTML = student.house;
        klon.querySelector(".blood p").innerHTML = student.blood;

        klon.querySelector(".expelliamus").addEventListener("click",function(){//expells students by click on button
            expellStudent(student);
        });

        if (student.expelled == true) {
            klon.querySelector(".expelliamus").classList.add("expelledB");//makes expelled students stay in expelled list and makes button unclickable
        }

        klon.querySelector(".student").addEventListener("click", function(){
            displaySingleStudent(student);
        })
        
        sectionPointer.appendChild(klon);
        
    })
}

function expellStudent(student) {
    if (student.expelled == false) {
        student.expelled = true;
        student.inquis = false;
        student.prefect = false;
        console.log("expell: " + student.firstName);
        expelledStudents.unshift(student);
        cleanStudentData.splice(cleanStudentData.indexOf(student),1);
        buildList();
    }
    
}

function nameSplitter(fullName) {

    const removedCharacters1 = fullName.replace("-"," ");//removes -
    const removedCharacters2 = removedCharacters1.replaceAll('"',"");//removes ""
    const trimmedName = removedCharacters2.trim(); // removes spaces before and after names

    const firstSpace = trimmedName.indexOf(" ");
    const firstName = trimmedName.charAt(0).toUpperCase() + trimmedName.substring(1,firstSpace).toLowerCase();
    let middleName = "";
    let lastName = "";
    

    if (trimmedName.split(" ").length < 3) {
        lastName = trimmedName.charAt(firstSpace+1).toUpperCase() + trimmedName.substring(firstSpace+2).toLowerCase();
        middleName = null;
    }

    else {
        const lastSpace = trimmedName.lastIndexOf(" ");
        middleName = trimmedName.charAt(firstSpace+1).toUpperCase() + trimmedName.substring(firstSpace+2,lastSpace).toLowerCase();

        lastName = trimmedName.charAt(lastSpace+1).toUpperCase() + trimmedName.substring(lastSpace+2).toLowerCase();
    }

    return {firstName,middleName,lastName};
}

function houseAndGenderCaseCorrector(student) {
    const trimmedHouse = student.house.trim();
    const house = trimmedHouse.charAt(0).toUpperCase() + trimmedHouse.substring(1).toLowerCase();
    const gender = student.gender.charAt(0).toUpperCase() + student.gender.substring(1).toLowerCase();
    return {house,gender};
}

function addSortingEvents() {
    console.log("sorting available");
    document.querySelector('#legend h3:nth-child(1)').addEventListener("click",sortByFirstName);
    document.querySelector('#legend h3:nth-child(2)').addEventListener("click",sortByMiddleName);
    document.querySelector('#legend h3:nth-child(3)').addEventListener("click",sortByLastName);
    document.querySelector('#legend h3:nth-child(4)').addEventListener("click",sortByGender);
    document.querySelector('#legend h3:nth-child(5)').addEventListener("click",sortByHouse);
    // document.querySelector('#legend h3:nth-child(7)').addEventListener("click",sortByBlood);
}

function sortByFirstName() {
    console.log("sorting of first name")
    
    let filtered = filteredStudents.sort(alphabeticalSortFirstName);
    //lets sorting work with search
    if (document.querySelector("#searchField").value != "") {
        filtered = filteredStudents.sort(alphabeticalSortFirstName).filter(isSearch);
    }

    if (firstNameSortstatus == false) {
        displayStudentsList(filtered);
        
    }
    if (firstNameSortstatus == true) {
        displayStudentsList(filtered.reverse())
        
    }
    firstNameSortstatus =  firstNameSortstatus ? false : true; //toggles filterstatus value
    middleNameSortstatus = false;
    lastNameSortstatus = false;
    genderSortstatus = false;
    houseSortstatus = false;
}

function sortByMiddleName() {
    console.log("sorting of middle name")

    let filtered = filteredStudents.sort(alphabeticalSortMiddleName);

    //lets sorting work with search
    if (document.querySelector("#searchField").value != "") {
        filtered = filtered.filter(isSearch);
    }

    if (middleNameSortstatus == false) {
        displayStudentsList(filtered);
        
    }
    if (middleNameSortstatus == true) {
        displayStudentsList(filtered.reverse())
        
    }
    middleNameSortstatus =  middleNameSortstatus ? false : true; //toggles filterstatus value
    firstNameSortstatus = false;
    lastNameSortstatus = false;
    genderSortstatus = false;
    houseSortstatus = false;
}

function sortByLastName() {
    console.log("sorting of last name")
    
    let filtered = filteredStudents.sort(alphabeticalSortLastName);

    //lets sorting work with search
    if (document.querySelector("#searchField").value != "") {
        filtered = filteredStudents.sort(alphabeticalSortLastName).filter(isSearch);
    }

    if (lastNameSortstatus == false) {
        displayStudentsList(filtered);
        
    }
    if (lastNameSortstatus == true) {
        displayStudentsList(filtered.reverse())
        
    }
    lastNameSortstatus =  lastNameSortstatus ? false : true; //toggles filterstatus value
    firstNameSortstatus = false;
    middleNameSortstatus = false;
    genderSortstatus = false;
    houseSortstatus = false;
}

function sortByGender() {
    console.log("sorting of gender")
    
    let filtered = filteredStudents.sort(alphabeticalSortGender);

    //lets sorting work with search
    if (document.querySelector("#searchField").value != "") {
        filtered = filteredStudents.sort(alphabeticalSortGender).filter(isSearch);
    }

    if (genderSortstatus == false) {
        displayStudentsList(filtered);
        
    }
    if (genderSortstatus == true) {
        displayStudentsList(filtered.reverse())
        
    }
    genderSortstatus =  genderSortstatus ? false : true; //toggles filterstatus value
    firstNameSortstatus = false;
    middleNameSortstatus = false;
    lastNameSortstatus = false;
    houseSortstatus = false;
}

function sortByHouse() {
    console.log("sorting of house")
    
    let filtered = filteredStudents.sort(alphabeticalSortHouse);

    //lets sorting work with search
    if (document.querySelector("#searchField").value != "") {
        filtered = filteredStudents.sort(alphabeticalSortHouse).filter(isSearch);
    }

    if (houseSortstatus == false) {
        displayStudentsList(filtered);
        
    }
    if (houseSortstatus == true) {
        displayStudentsList(filtered.reverse())
        
    }
    houseSortstatus =  houseSortstatus ? false : true; //toggles filterstatus value
    firstNameSortstatus = false;
    middleNameSortstatus = false;
    lastNameSortstatus = false;
    genderSortstatus = false;
}

//We dont sort by blood here since that would be racist :)

function alphabeticalSortFirstName(a,b) {
    
    if (a.firstName < b.firstName) {
        return -1;
    }

    else {
        return 1;
    }

}

function alphabeticalSortMiddleName(a,b) {
    
    //following if fixes issue with null value of sorting middlenames

    if (middleNameSortstatus == false && b.middleName === null) {
        return -1;
    }
    else if (middleNameSortstatus == false && a.middleName < b.middleName) {
        return -1;
    }

    if (middleNameSortstatus == true && b.middleName === null) {
        return 1;
    }
    else if (middleNameSortstatus == true && a.middleName < b.middleName) {
        return -1;
    }



    // else if (b === null) {
    //     return 1;
    // }
    
    else {
        return 1;
    }

}

function alphabeticalSortLastName(a,b) {
    
    if (a.lastName < b.lastName) {
        return -1;
    }

    else {
        return 1;
    }

}

function alphabeticalSortGender(a,b) {
    
    if (a.gender < b.gender) {
        return -1;
    }

    else {
        return 1;
    }

}

function alphabeticalSortHouse(a,b) {
    
    if (a.house < b.house) {
        return -1;
    }

    else {
        return 1;
    }

}

function addFilterEvents()  {
    console.log("filtering available");
    // document.querySelector("#button1").addEventListener("click", filterCurrentStudents);
    // document.querySelector("#button2").addEventListener("click", filterExpelledStudents);
    document.querySelector("#houses_select").addEventListener("change", filterHouses);
    document.querySelector("#houses_select").addEventListener("change", buildList);
    document.querySelector("#resetButton").addEventListener("click", resetFilters);
    document.querySelector("#currentButton").addEventListener("click", currentStudents);
    document.querySelector("#expelledButton").addEventListener("click", function(){
        document.querySelector("#searchField").value = "";
        displayStudentsList(expelledStudents);
        filteredStudents = expelledStudents;
    });
    document.querySelector("#inqButton").addEventListener("click", inquisitorialFilter);
    document.querySelector("#preButton").addEventListener("click", prefectFilter);
    document.querySelector("#searchField").addEventListener("input",searchInput);
    
}

function currentStudents() {
    filteredStudents = cleanStudentData;
    document.querySelector("#searchField").value = "";
    buildList();
}

function inquisitorialFilter() {
    filteredStudents = cleanStudentData.filter(isInq);
    document.querySelector("#searchField").value = "";
    buildList();
}

function isInq(student) {
    if (student.inquisitorial === true) {
        return true;
    }
    else {
        return false;
    }
}

function prefectFilter() {
    filteredStudents = cleanStudentData.filter(isPre);
    document.querySelector("#searchField").value = "";
    buildList();
}

function isPre(student) {
    if (student.prefect === true) {
        return true;
    }
    else {
        return false;
    }
}

function filterHouses() {

    let filtering = filteredStudents; //makes it so filter reset between switches

    if (document.querySelector("#houses_select").value == "gryffindor") {
        console.log("only showing griffindor");
        filtering = filteredStudents.filter(isGryffindor);
        
    }

    else if (document.querySelector("#houses_select").value == "hufflepuff") {
        console.log("only showing hufflepuff");
        filtering = filteredStudents.filter(isHufflepuff);
        
    }

    else if (document.querySelector("#houses_select").value == "ravenclaw") {
        console.log("only showing ravenclaw");
        filtering = filteredStudents.filter(isRavenclaw);
        
    }

    else if (document.querySelector("#houses_select").value == "slytherin") {
        console.log("only showing slytherin");
        filtering = filteredStudents.filter(isSlytherin);
        
    }

    else if (document.querySelector("#houses_select").value == "starter") {
        filtering = filteredStudents;
        
    }
    

    return filtering;
}

function isGryffindor(student) {
    if (student.house === "Gryffindor") {
        return true;
    }
    else {
        return false;
    }
}

function isHufflepuff(student) {
    if (student.house === "Hufflepuff") {
        return true;
    }
    else {
        return false;
    }
}

function isRavenclaw(student) {
    if (student.house === "Ravenclaw") {
        return true;
    }
    else {
        return false;
    }
}

function isSlytherin(student) {
    if (student.house === "Slytherin") {
        return true;
    }
    else {
        return false;
    }
}

function resetFilters() {
    filteredStudents = cleanStudentData;
    document.querySelector("#houses_select").value = "starter";
    document.querySelector("#searchField").value = "";
    displayStudentsList(filteredStudents);
}

function displaySingleStudent(student) {
    document.querySelector("#popop").className = "";//removes hidden class to show html
    //finds image url
    document.querySelector("#popop img").src = "images/" + student.lastName.toLowerCase() + "_" + student.firstName.charAt(0).toLowerCase() + ".png";
    //displays names in correct fields
    document.querySelector("#popopFirstName").innerHTML = "First name: " + student.firstName;
    document.querySelector("#popopMiddleName").innerHTML = "Middle name: " + student.middleName;
    if (student.middleName == null) {
        document.querySelector("#popopMiddleName").innerHTML = "";
    }
    document.querySelector("#popopLastName").innerHTML = "Last name: " + student.lastName;
    //displays house and bloodtypes in correct fields
    document.querySelector("#popopHouse").innerHTML = "House: " + student.house;
    document.querySelector("#popopBlood").innerHTML = "Blood: " + student.blood;
    // displays 
    document.querySelector("#popopPrefect").innerHTML = "Prefect member: " + student.prefect;
    document.querySelector("#popopInquisitorial").innerHTML = "Inquisitorial member: " + student.inquisitorial;
    document.querySelector("#popopExpelled").innerHTML = "Expelled status: " + student.expelled;

    //sets global variable
    globalObject = student;

    //clears eventListeners
    document.querySelector("#prefectButton").removeEventListener("click", togglePrefect);
    document.querySelector("#inquisitorialButton").removeEventListener("click", toggleInquisitorial);
    document.querySelector("#expellSinglButton").removeEventListener("click", singleExpell);

    //adds eventlisteners to buttons on popop
    document.querySelector("#prefectButton").addEventListener("click", togglePrefect);
    document.querySelector("#inquisitorialButton").addEventListener("click", toggleInquisitorial)
    document.querySelector("#expellSinglButton").addEventListener("click", singleExpell)


    //checks if url exists and makes new string if doesnt with full first name after last name and if nothing there uses notfound.png
    const checkImage = imageExists("images/" + student.lastName.toLowerCase() + "_" + student.firstName.charAt(0).toLowerCase() + ".png");
    
    if (checkImage == false) {
        document.querySelector("#popop img").src = "images/" + student.lastName.toLowerCase() + "_" + student.firstName.toLowerCase() + ".png";
        const secondImageCheck = imageExists("images/" + student.lastName.toLowerCase() + "_" + student.firstName.toLowerCase() + ".png");
        if (secondImageCheck == false) {
            console.log("image not available");
            document.querySelector("#popop img").src = "images/notfound.png";
        }
    }

    //sets correct background and text color based on house value
    
    if (student.house == "Gryffindor") {
        document.querySelector("#popop").style.backgroundColor = "#740001";
        document.querySelectorAll("#popop h2").forEach(e => e.style.color = "#C0C0C0");
    }
    if (student.house == "Hufflepuff") {
        document.querySelector("#popop").style.backgroundColor = "#FFF4B1";
        document.querySelectorAll("#popop h2").forEach(e => e.style.color = "#000000");
    }
    if (student.house == "Ravenclaw") {
        document.querySelector("#popop").style.backgroundColor = "#0E1A40";
        document.querySelectorAll("#popop h2").forEach(e => e.style.color = "#946B2D");
    }
    if (student.house == "Slytherin") {
        document.querySelector("#popop").style.backgroundColor = "#1A472A";
        document.querySelectorAll("#popop h2").forEach(e => e.style.color = "#AAAAAA");
    }
}

function imageExists(url) {//https://stackoverflow.com/questions/18837735/check-if-image-exists-on-server-using-javascript
    //used to check weather image file loads or not.

    let http = new XMLHttpRequest();

    http.open('HEAD', url, false);
    http.send();

    return http.status != 404;

}

function togglePrefect() {

    const filterType = determineHouse(globalObject.house);
    

if (prefectStudents.filter(filterType).length < 2 && prefectStudents.includes(globalObject) == false) {
    console.log("Added "+ globalObject.firstName +" prefect");
    
    globalObject.prefect = true;
    prefectStudents.unshift(globalObject);
    //add prefect
}
else if (prefectStudents.includes(globalObject) == true) {
    console.log("removed "+ globalObject.firstName +" prefect");
    globalObject.prefect = false;
    prefectStudents.splice(prefectStudents.indexOf(globalObject),1);
    //remove from prefects
}
else if (prefectStudents.filter(filterType).length >=2 && prefectStudents.includes(globalObject) == false) {
    // Do nothing ask if want to remove another prefect and then add prefect
    console.log("there is already 2 " + globalObject.house + " prefects");
    
}
document.querySelector("#popopPrefect").innerHTML = "Prefect member: " + globalObject.prefect;
}

function determineHouse(house) {
    if (house == "Gryffindor") {
        return isGryffindor;
    }
    if (house == "Ravenclaw") {
        return isRavenclaw;
    }
    if (house == "Hufflepuff") {
        return isHufflepuff;
    }
    if (house == "Slytherin") {
        return isSlytherin;
    }
}

function toggleInquisitorial() {
    
    
    if (globalObject.inquisitorial == false && globalObject.house == "Slytherin" && globalObject.blood == "Pure-Blood") {
        globalObject.inquisitorial = true;
    }

    else if (globalObject.inquisitorial == true) {
        globalObject.inquisitorial = false;
    }

    //if hackTheSystem has been called
    if (hacked == true) {
        globalObject.inquisitorial = true;

        const currentInq = globalObject;
        setTimeout(function(){
            currentInq.inquisitorial = false;

            document.querySelector("#popopInquisitorial").innerHTML = "Inquisitorial member: " + globalObject.inquisitorial;
            buildList();
        },3000)
    }

    document.querySelector("#popopInquisitorial").innerHTML = "Inquisitorial member: " + globalObject.inquisitorial;
    buildList();
}

function singleExpell() {
    //use globalObject to expell
    expellStudent(globalObject);
    document.querySelector("#popopExpelled").innerHTML = "Expelled status: " + globalObject.expelled;
}

function searchInput() {

    if (document.querySelector("#searchField").value == "") {
        buildList();
    }

    else {

        let filteredList = filterHouses();

        let searchArray = filteredList.filter(isSearch);
    
        displayStudentsList(searchArray);

    }


    
}

function isSearch(student) {

    let searchParameter = document.querySelector("#searchField").value;
    let searchUnCapitalized = searchParameter.charAt(0).toUpperCase() + searchParameter.substring(1)

    if (student.firstName.includes(searchParameter) == true || student.lastName.includes(searchParameter) == true) {
        return true;
    }

    if (student.firstName.includes(searchUnCapitalized) == true || student.lastName.includes(searchUnCapitalized) == true) {
        return true;
    }
    
    else {
        return false;
    }
}

function displayStudentStats(displayedArray) {

    document.querySelector("#currentStats").innerHTML = "Currently Enlisted Students: " + cleanStudentData.length + ".";

    document.querySelector("#expelledStats").innerHTML = "Expelled Students: " + expelledStudents.length + ".";
    
    document.querySelector("#gStats").innerHTML = "Gryffindor: " + cleanStudentData.filter(isGryffindor).length + ".";
    document.querySelector("#hStats").innerHTML = "Hufflepuff: " + cleanStudentData.filter(isHufflepuff).length + ".";
    document.querySelector("#rStats").innerHTML = "Ravenclaw: " + cleanStudentData.filter(isRavenclaw).length + ".";
    document.querySelector("#sStats").innerHTML = "Slytherin: " + cleanStudentData.filter(isSlytherin).length + ".";

    document.querySelector("#displayedStats").innerHTML = "Currently Displayed Students: " + displayedArray.length + ".";

}

function closeSingle() {
    document.querySelector("#popop").classList.add("hidden");
}

function hackTheSystem() {

    if (hacked == false) {
        console.log("Do you think thats air you're breathing?");
        //creates me
     const felix = {
        firstName       : "Felix",
        middleName      : "",
        lastName        : "Bryld",
        gender          : "Boy",
        house           : "Slytherin",
        blood           : "Halv Dansker",
        prefect         : false,
        inquisitorial   : false,
        expelled        : null//makes me unexpellable;
      };
      

      //randomizes blood status
      cleanStudentData.forEach(student => {

        const randomNR = Math.floor(Math.random() * 3) + 1  

        if (randomNR == 1) {
            student.blood = "Pure-Blood";
        }

        if (randomNR == 2) {
            student.blood = "Half-Blood";
        }

        if (randomNR == 3){
            student.blood = "Muggle";
        }
        
      })
      // pushes me to array
      cleanStudentData.push(felix);
      buildList();
    }
    else {
        console.log("already hacked");
    }
    //sets hacked to true so functions act differently
      hacked = true;
}