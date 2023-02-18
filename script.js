let key = "RGAPI-071df365-6f5a-42fa-a788-0dbc410886b2";
let tableMade = false;
let playerSearch = false;
let liveGame = false;

async function fetchSumByName(){
    // Get summoner information from Riot Games API
    let data;
    //let name = prompt("Please enter a summoner name.\nExample: Sayo, Gardakan72");

    let name = document.getElementById("searchName").value;

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
    document.getElementById("summonerName").innerHTML = "Current Summoner: " + name;
    return data;
}

async function fetchChampMastery(id){
    let url = "https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" + id + "?api_key=" + key;
    let res = await fetch(url);
    // Turn the response into a json and return it
    let data = await res.json();
    return data;
}

function masteryInfoTable(info, totalMastery){
    let headers = ["", "Champion", "Mastery Level", "Mastery Points", "Chest Obtained", "Last Date Played", "Mastery Progress"];
    let table = document.createElement("Table");
    table.id = "dataTable";
    table.style.textAlign = 'center';
    table.style.border = '1px solid black';
    table.style.backgroundColor = '#13008B'; // Table background
    table.style.color = 'white'; // Text color
    table.cellPadding = '10 px';
    let totalMasteryPoints = 0;
    let totalChestsObtained = 0;
    for(let i = 0; i < info.length; i++){
        let data = table.insertRow(i);
        let champPortait = champIcons(info[i][0], info[i][6]);
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
    document.body.append(table); // Display the data
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

function champIcons(champName, champId){
    let champPortait = new Image();
    champPortait.src = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/" + champId + ".png";
    champPortait.style.width = "35%";
    champPortait.onclick = function(){
        // Handle champions with strange names
        champLink = champName.replace(" ", "-").replace("'", "-").replace("-& Willump", "").replace("-Glasc", "").replace(".", "");
        console.log(champLink);
        // Open official Riot Games champion page in a new tab
        window.open("https://www.leagueoflegends.com/en-us/champions/" + champLink + "/", "_blank");
    }
    return champPortait;
}

function timeSinceStart(gameStart){
    let timeMs = Date.now() - gameStart;
    let min = Math.floor(timeMs / 60000)
    let sec = ((timeMs % 60000) / 1000).toFixed(0);
    if(sec < 10)
        return min + ":0" + sec;
    return min + ":" + sec;
}

function liveGameInfoTable(gameMode, gameId, gameStart, teamOne, teamTwo, teamOneBans, teamTwoBans){
    // Team array format
    // SummonerName | Summoner Id | Champion Name | Champion ID
    // Banned champ array format
    // Champion Name | Champion ID | Turn Pick
    let headers = ["Bans", "Pick Order", "Summoner", "Champion", "Champion", "Summoner", "Pick Order", "Bans"];
    let table = document.createElement("Table");
    table.id = "dataTable";
    table.style.textAlign = 'center';
    table.style.border = '1px solid black';
    table.style.backgroundColor = '#13008B'; // Table background
    table.style.color = 'white'; // Text color
    table.cellPadding = '10 px';
    // Display game time
    let gameStats = table.insertRow();
    gameStats.insertCell(0).innerHTML = "";
    gameStats.insertCell(1).innerHTML = "Time:";
    gameStats.insertCell(2).innerHTML = timeSinceStart(gameStart);
    gameStats.insertCell(3).innerHTML = "";
    gameStats.insertCell(4).innerHTML = "";
    gameStats.insertCell(5).innerHTML = "Mode:";
    gameStats.insertCell(6).innerHTML = gameMode;
    for(let i = 0; i < teamOne.length; i++){
        let data = table.insertRow(i);
        champ1 = champIcons(teamOne[i][2], teamOne[i][3]);
        champ2 = champIcons(teamTwo[i][2], teamTwo[i][3]);
        bannedChamp1 = champIcons(teamOneBans[i][0], teamOneBans[i][1]);
        bannedChamp2 = champIcons(teamTwoBans[i][0], teamTwoBans[i][1]);
        data.insertCell(0).append(bannedChamp1);
        data.insertCell(1).innerHTML = teamOneBans[i][2]; // Team One Pick
        data.insertCell(2).innerHTML = teamOne[i][0]; // Summoner Name
        data.insertCell(3).append(champ1); // Champion Portait
        data.insertCell(4).append(champ2) // Champion Portait
        data.insertCell(5).innerHTML = teamTwo[i][0]; // Summoner Name
        data.insertCell(6).innerHTML = teamTwoBans[i][2]; // Team Two Pick
        data.insertCell(7).append(bannedChamp2);
        if(i % 2 != 0)
            data.style.backgroundColor = '#00056C';
    }
    let teamHeader = table.createTHead();
    teams = teamHeader.insertRow();
    //teams.style.background = "#ffbb00";
    teams.insertCell(0).innerHTML = "Game ID:";
    teams.insertCell(1).innerHTML = gameId;
    teams.insertCell(2).innerHTML = "TEAM 1";
    teams.insertCell(3).innerHTML = "";
    teams.insertCell(4).innerHTML = "";
    teams.insertCell(5).innerHTML = "TEAM 2";
    teams.insertCell(6).innerHTML = "";
    teams.insertCell(7).innerHTML = "";
    teams.insertCell(8).innerHTML = "";
    let header = table.createTHead();
    row = header.insertRow();
    row.style.backgroundColor = "#00056C";
    for(let i = 0; i < headers.length; i++){
        row.insertCell(i).innerHTML = headers[i];
    }
    document.body.append(table); // Display the data
    // Keep the table at the center of the page
    let centerTable = () => {
        table.style.margin = "auto";
    }
    centerTable();
    window.addEventListener('resize', centerTable);
}

async function getRanks(id){
    let url = "https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + id + "?api_key=" + key;
    try{
        let rankData = await fetch(url);
        let rank = await rankData.json();
        return rank.tier;
    }catch{
        return "Unranked";
    }
}

function liveGameDetails(findByKey, gameData){
    // Sort game data information
    gameId = gameData.gameId;
    gameMode = gameData.gameMode;
    gameStart = gameData.gameStartTime;
    let teamOne = []; // Blue Team
    let teamTwo = []; // Red Team
    let teamOneBans = [];
    let teamTwoBans = [];
    // Store team data in the format:
    // SummonerName | Summoner Id | Champion Name | Champion ID
    gameData.participants.forEach(player => {
        if(player.teamId === 100)
            teamOne.push([player.summonerName, player.summonerId, findByKey(player.championId)[1].name, player.championId]);
        else
            teamTwo.push([player.summonerName, player.summonerId, findByKey(player.championId)[1].name, player.championId]);
    });
    // Store banned champ data in the format:
    // Champion Name | Champion ID | Turn Pick
    gameData.bannedChampions.forEach(champ => {
        if(champ.teamId === 100)
            teamOneBans.push([findByKey(champ.championId)[1].name, champ.championId, champ.pickTurn]);
        else
            teamTwoBans.push([findByKey(champ.championId)[1].name, champ.championId, champ.pickTurn]);
    });
    console.log(teamOneBans);
    if(!tableMade)
        liveGameInfoTable(gameMode, gameId, gameStart, teamOne, teamTwo, teamOneBans, teamTwoBans);
    tableMade = true; // There is a data table present that needs to be cleared before loading the next summoner info
}

async function checkLiveGame(findByKey, data){
    let url = "https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" + data.id + "?api_key=" + key;
    let gameData;
    let playing = false;
    try{
        let live = await fetch(url);
        gameData= await live.json();
        liveGameDetails(findByKey, gameData);
    }catch{
        playing = false;
        alert("Player is not currently in a match right now.");
    }
}

async function searchPlayer(findByKey, data){
    // Retrieve champion mastery for this summoner
    let champMastery = await fetchChampMastery(data.id);
    let fetchTotalMastery = await fetch("https://na1.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/" + data.id + "?api_key=" + key);
    let totalMastery = await fetchTotalMastery.json();
    // Create an array to contain all champion info for this summoner
    champInfo = formatedChampionMastery(champMastery, findByKey);
    // Create a table of information from the champ Mastery information
    if(!tableMade)
        masteryInfoTable(champInfo, totalMastery);
    tableMade = true; // There is a data table present that needs to be cleared before loading the next summoner info
}

async function main(){
    // All champion data
    let championData = await fetch("http://ddragon.leagueoflegends.com/cdn/13.1.1/data/en_US/champion.json");
    let champData = await championData.json();
    let findByKey = (matchKey) => Object.entries(champData.data).find(([key, value]) => value.key == matchKey);

    // Get the summoner's account information needed for all following methods
    let data = await fetchSumByName();

    // Get general summoner mastery information
    if(playerSearch)
        searchPlayer(findByKey, data);
    if(liveGame)
        checkLiveGame(findByKey, data);
    console.log(data);
    console.log("We've reached the end");
}

function newSearch(){
    if(tableMade){
        let data = document.getElementById("dataTable");
        data.remove();
        tableMade = false;
    }
    playerSearch = true;
    liveGame = false;
    main();
}

function newLiveGame(){
    if(tableMade){
        let data = document.getElementById("dataTable");
        data.remove();
        tableMade = false;
    }
    playerSearch = false;
    liveGame = true;
    main();
}

// If the user presses enter after inputting a Summoner Name
let input = document.getElementById("searchName");
input.addEventListener("keypress", function(event){
    if(event.key === "Enter"){
        event.preventDefault();
        document.getElementById("search").click();
    }
})