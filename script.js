let key = "RGAPI-071df365-6f5a-42fa-a788-0dbc410886b2";

async function fetchSumByName(){
    // Get summoner information from Riot Games API
    let data;
    let name = prompt("Please enter a summoner name.\nExample: Sayo, Gardakan72");
    // Trap the user if they do not input a valid summoner name
    let found = false;
    while(!found || name.toLowerCase() == "null"){
        let url = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;
        try{
            let res = await fetch(url);
            found = true;
            data = res.json();
        }catch{
            name = prompt("Summoner name not found. Please enter a valid summoner name.\nExample: Sayo, Gardakan72");
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
    let headers = ["", "Champion", "Mastery Level", "Mastery Points", "Chest Obtained", "Last Date Played", "Mastery Progress"];
    let table = document.createElement("Table");
    table.style.textAlign = 'center';
    table.style.border = '1px solid black';
    table.style.backgroundColor = '#13008B'; // Table background
    table.style.color = 'white'; // Text color
    table.cellPadding = '10 px';
    let totalMasteryPoints = 0;
    let totalChestsObtained = 0;
    for(let i = 0; i < info.length; i++){
        let data = table.insertRow(i);
        let champPortait = new Image();
        champPortait.src = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/" + info[i][6] + ".png";
        champPortait.style.width = "35%";
        champPortait.onclick = function(){
            // Handle champions with strange names
            champLink = info[i][0].replace(" ", "-").replace("'", "-").replace("-& Willump", "").replace("-Glasc", "").replace(".", "");
            console.log(champLink);
            // Open official Riot Games champion page in a new tab
            window.open("https://www.leagueoflegends.com/en-us/champions/" + champLink + "/", "_blank");
        }
        data.insertCell(0).append(champPortait); // Champion Portait
        data.insertCell(1).innerHTML = info[i][0]; // Champion Name
        data.insertCell(2).innerHTML = info[i][1]; // Mastery Level
        data.insertCell(3).innerHTML = info[i][2].toLocaleString("en-US"); // Mastery Points
        data.insertCell(4).innerHTML = info[i][3]; // Chest Obtained
        data.insertCell(5).innerHTML = info[i][4]; // Last Date Played
        data.insertCell(6).innerHTML = info[i][5]; // Mastery Progress
        totalMasteryPoints += info[i][2];
        if(info[i][3] === "Earned")
            totalChestsObtained++;
        if(i % 2 != 0)
            data.style.backgroundColor = '#00056C';
    }
    // Insert the player's total mastery information
    let total = table.insertRow();
    total.insertCell(0).innerHTML;
    total.insertCell(1).innerHTML = "TOTALS";
    total.insertCell(2).innerHTML = "Level " + totalMastery;
    total.insertCell(3).innerHTML = totalMasteryPoints.toLocaleString("en-US") + " Points";
    total.insertCell(4).innerHTML = totalChestsObtained + " Chests Earned";
    total.insertCell(5).innerHTML;
    total.insertCell(6).innerHTML;
    if(info.length % 2 != 0)
        total.style.backgroundColor = "#00056C";
    let header = table.createTHead();
    row = header.insertRow();
    row.style.backgroundColor = "#00056C";
    for(let i = 0; i < headers.length; i++){
        row.insertCell(i).innerHTML = headers[i];
    }
    document.body.append(table);
    // Keep the table at the center of the page
    let centerTable = () => {
        table.style.margin = "auto";
    }
    centerTable();
    window.addEventListener('resize', centerTable);
}

function formatedChampionMastery(champMastery, findByKey){
    champInfo = [];
    champMastery.forEach(champ => {
        champName = findByKey(champ.championId)[1].name;
        champLevel = champ.championLevel;
        champPoints = champ.championPoints;
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
        // champName | champLevel | champPoints | Chest Obtained | Last Time Champ Was Played | Mastery Progress | champion ID
        champInfo.push([champName, champLevel, champPoints, chestObtained, lastPlayed, champProgress, champ.championId]);
        // Store champion Id so that it may be used to locate champion portait
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