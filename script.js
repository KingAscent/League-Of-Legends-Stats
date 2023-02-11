let key = "RGAPI-071df365-6f5a-42fa-a788-0dbc410886b2";

async function fetchSumByName(){
    // Get summoner information from Riot Games API
    let data;
    let name = prompt("Please enter a summoner name.\nExample: Sayo");
    // Trap the user if they do not input a valid summoner name
    let found = false;
    while(!found || name.toLowerCase() == "null"){
        let url = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;
        try{
            let res = await fetch(url);
            found = true;
            data = res.json();
        }catch{
            name = prompt("Summoner name not found. Please enter a valid summoner name.\nExample: Sayo");
        }
    }
    return data;
}

async function fetchChampMastery(id){
    let url = "https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" + id + "?api_key=" + key;
    let res = await fetch(url);
    // Turn the response into a json and return it
    let data = await res.json();
    return data;
}

function infoTable(info, totalMastery){
    let headers = ["Champion", "Mastery Level", "Mastery Points", "Chest Obtained", "Last Date Played", "Mastery Progress"];
    let table = document.createElement("table");
    table.style.textAlign = 'center';
    for(let i = 0; i < info.length; i++){
        let data = table.insertRow(i);
        data.insertCell(0).innerHTML = info[i][0]; // Champion
        data.insertCell(1).innerHTML = info[i][1]; // Mastery Level
        data.insertCell(2).innerHTML = info[i][2]; // Mastery Points
        data.insertCell(3).innerHTML = info[i][3]; // Chest Obtained
        data.insertCell(4).innerHTML = info[i][4]; // Last Date Played
        data.insertCell(5).innerHTML = info[i][5]; // Mastery Progress
        if(i % 2 != 0)
        data.style.backgroundColor = "#CCCDCD";
    }
    // Insert the player's total mastery information
    let total = table.insertRow();
    total.insertCell(0).innerHTML = "TOTAL";
    if(info.length % 2 != 0)
        total.style.backgroundColor = "#CCCDCD";
    total.insertCell(1).innerHTML = totalMastery;
    let header = table.createTHead();
    row = header.insertRow();
    row.style.backgroundColor = "#CCCDCD";
    for(let i = 0; i < headers.length; i++){
        row.insertCell(i).innerHTML = headers[i];
    }
    document.body.append(table);
    // Keep the table at the center of the page
    const centerTable = () => {
        table.style.marginLeft = (window.innerWidth / 2) - (table.clientWidth / 2) + "px";
    }
    centerTable();
    window.addEventListener('resize', centerTable);
}

function formatedChampionMastery(champMastery, findByKey){
    champInfo = [];
    champMastery.forEach(champ => {
        champName = findByKey(champ.championId)[1].name;
        champLevel = champ.championLevel;
        champPoints = champ.championPoints.toLocaleString("en-US");
        chestObtained = champ.chestGranted;
        if(chestObtained){
            chestObtained = "Earned";
        }else{
            chestObtained = "Not Earned";
        }
        lastPlayed = new Date(champ.lastPlayTime).toString().substring(4, 15);
        // Format the lastPlayed substring to an even more readable string
        lastPlayed = lastPlayed.substring(4, 7) + lastPlayed.substring(0, 4) + lastPlayed.substring(6, 11);
        champProgress = champ.tokensEarned;
        if(champLevel == 7)
            champProgress = "Mastered";
        else if(champLevel == 6)
            champProgress = "Tokens earned: " + champProgress + " / 3";
        else if(champLevel == 5)
            champProgress = "Tokens earned: " + champProgress + " / 2";
        else
            champProgress = "Points until next level: " + champ.championPointsUntilNextLevel;
        // Store champ information in the format:
        // champName | champLevel | champPoints | Chest Obtained | Last Time Champ Was Played | Mastery Progress
        champInfo.push([champName, champLevel, champPoints, chestObtained, lastPlayed, champProgress]);
    });
    return champInfo;
}


async function main(){
    // All champion data
    let championData = await fetch("http://ddragon.leagueoflegends.com/cdn/13.1.1/data/en_US/champion.json");
    let champData = await championData.json();
    let findByKey = (matchKey) => Object.entries(champData.data).find(([key, value]) => value.key == matchKey);

    // Get the summoner's account information needed for all following methods
    let data = await fetchSumByName();
    // Retrieve champion mastery for this summoner
    let champMastery = await fetchChampMastery(data.id);
    let fetchTotalMastery = await fetch("https://na1.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/" + data.id + "?api_key=" + key);
    let totalMastery = await fetchTotalMastery.json();
    // Create an array to contain all champion info for this summoner
    champInfo = formatedChampionMastery(champMastery, findByKey);
    // Create a table of information from the champ Mastery information
    infoTable(champInfo, totalMastery);
    console.log(data);
    console.log("We've reached the end");
}

main();