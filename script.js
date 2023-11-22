/*
    This is no longer operational due to the new Riot Games name change implemented. Will update in the future.
 */

let key = "RGAPI-a486416d-27fa-45d3-ab41-b75c70d4655a"; // Riot Games Developer Key
let tableMade = false; // Checks to see if a table is currently displayed on screen
let playerSearch = false; // True if a user wants to see a summoner's champion mastery
let liveGame = false; // True if a user wants to see a summoner's ongoing game
let version = "https://ddragon.leagueoflegends.com/cdn/13.23.1/data/en_US/champion.json"; // Version of League of Legends Champions

// NAME: fetchSumByName()
// PURPOSE: Access Riot Games API and retrieve a summoner name's information
// RETURN: json data file with the summoner name's account information
async function fetchSumByName(){
    let data;
    // Get summoner name from index.html input
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
} // End fetchSumByName()

// NAME: fetchChampMastery(id)
// PURPOSE: Access Riot Games API and retrieve a summoner name's champion mastery information
// PARAMETERS: id - The summoner name's encrypted user id
// RETURN: json data file with the summoner name's champion mastery information
async function fetchChampMastery(id){
    let url = "https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" + id + "?api_key=" + key;
    let res = await fetch(url);
    // Turn the response into a json and return it
    let data = await res.json();
    return data;
} // End fetchChampMastery(id)

// NAME: masteryInfo(table, info, totalMastery)
// PURPOSE: Build the table that would display a summoner's champion mastery data
//         inclusive of mastery points, chests earned, and last date played
// PARAMETERS: table - The data table that would display the information
//             info - A multidimensional array that contains the summoner's
//                   mastery data, organized for the table to display
//             totalMasteryLevel - The total mastery level of the summoner
function masteryInfo(table, info, totalMasteryLevel){
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
    total.insertCell(2).innerHTML = "Level " + totalMasteryLevel;
    total.insertCell(3).innerHTML = totalMasteryPoints.toLocaleString("en-US") + " Points";
    total.insertCell(4).innerHTML = totalChestsObtained + " Chests Earned";
    total.insertCell(5).innerHTML;
    total.insertCell(6).innerHTML;
    if(info.length % 2 != 0)
        total.style.backgroundColor = "#00056C";
} // End masteryInfo(table, info, totalMasteryLevel)

// NAME: masteryInfoHeaders(table)
// PURPOSE: Add the headers into the table displaying the summoner's champion mastery data
// PARAMETERS: table - The table that would display a summoner's champion mastery data
function masteryInfoHeaders(table){
    let headers = ["", "Champion", "Mastery Level", "Mastery Points", "Chest Obtained", "Last Date Played", "Mastery Progress"];
    let header = table.createTHead();
    row = header.insertRow();
    row.style.backgroundColor = "#00056C";
    for(let i = 0; i < headers.length; i++){
        row.insertCell(i).innerHTML = headers[i];
    }
} // End masteryInfoHeaders(table)


// NAME: masteryInfoTable(info, totalMasteryLevel)
// PURPOSE: Create the Table that would display a summoner's champion mastery data
// PARAMETERS: info - A multidimensional array that contains the summoner's
//                   mastery data, organized for the table to display
//             totalMasteryLevel - The total mastery level of the summoner
function masteryInfoTable(info, totalMasteryLevel){
    let table = document.createElement("Table");
    table.id = "dataTable"; // To identify table in the next search and remove it
    table.cellPadding = '10 px'; // Give the cells some padding

    masteryInfo(table, info, totalMasteryLevel); // Add all the data to the table
    masteryInfoHeaders(table); // Add all the headers to the table
    document.body.append(table); // Display the data

    // Keep the table at the center of the page
    let centerTable = () => {
        table.style.margin = "auto";
    }
    centerTable();
    window.addEventListener('resize', centerTable);
} // End masteryInfoTable(info, totalMasteryLevel)

// NAME: formatedChampionMastery(champMastery, findByKey)
// PURPOSE: Create a multidimensional array that contains all of a summoner's champion mastery
// PARAMETERS: champMastery - json file from the Riot Games API that contains a player's champion mastery data
//             findByKey - Method of identifying champions by using champion ID to retrieve name
// RETURN: Multidimensional array that contains all of a summoner's champion mastery data
function formatedChampionMastery(champMastery, findByKey){
    champInfo = [];
    champMastery.forEach(champ => {
        champName = findByKey(champ.championId)[1].name;
        champLevel = champ.championLevel; // Champion mastery level
        champPoints = champ.championPoints; // Champion mastery points
        chestObtained = champ.chestGranted; // Chest obtained on champ
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
} // End formatedChampionMastery(champMastery, findByKey)

// NAME: champIcons(champName, champId)
// PURPOSE: Retrieve a champion's portait using its champion ID, and a champion's Riot Games Official Information URL
// PARAMETERS: champName - The champion's name, used to retrieve a champion's Riot Games Official Information URL
//             champID - The champion's ID, used to retrieve a champion's portait
// RETURN: Portait of the given champion, which can be clicked on and open the Riot Games Official Information page for that champion
function champIcons(champName, champId){
    let champPortait = new Image();
    champPortait.src = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/" + champId + ".png";
    champPortait.style.width = "35%";
    champPortait.onclick = function(){
        // Handle champions with strange names
        champLink = champName.replace(" ", "-").replace("'", "-").replace("-& Willump", "").replace("-Glasc", "").replace(".", "");
        // Open official Riot Games champion page in a new tab
        window.open("https://www.leagueoflegends.com/en-us/champions/" + champLink + "/", "_blank");
    }
    return champPortait;
} // End champIcons(champName, champId)

// NAME: timeSinceStart(gameStart)
// PURPOSE: Check how long a live game has been going
// PARAMETERS: gameStart - The time a game started at
// RETURN: The duration of the game in the format: minmin:secsec
function timeSinceStart(gameStart){
    let timeMs = Date.now() - gameStart;
    let min = Math.floor(timeMs / 60000)
    let sec = ((timeMs % 60000) / 1000).toFixed(0);
    if(sec < 10)
        return min + ":0" + sec;
    return min + ":" + sec;
} // End timeSinceStart(gameStart)

// NAME: liveGameStats(table, gameStart, gameMode)
// PURPOSE: Place the stats of a live game onto the table
// PARAMETERS: table - The table that displays live game information
//             gameStart - The time a game started at
//             gameMode - The game mode being played
function liveGameStats(table, gameStart, gameMode){
    let gameStats = table.insertRow();
    gameStats.insertCell(0).innerHTML = "";
    gameStats.insertCell(1).innerHTML = "Time:";
    gameStats.insertCell(2).innerHTML = timeSinceStart(gameStart);
    gameStats.insertCell(3).innerHTML = "";
    gameStats.insertCell(4).innerHTML = "";
    gameStats.insertCell(5).innerHTML = "Mode:";
    gameStats.insertCell(6).innerHTML = gameMode;
} // End liveGameStats(table, gameStart, gameMode)

// NAME: liveGameInfo(table, teamOne, teamTwo, teamOneBans, teamTwoBans)
// PURPOSE: Fill in the information of an ongoing game
// PARAMETERS: table - The table that displays live game information
//             teamOne - The first team in the game
//             teamTwo - The second team in the game
//             teamOneBans - The champions that teamOne bans in champion select
//             teamTwoBans - The champions that teamTwo bans in champion select
function liveGameInfo(table, teamOne, teamTwo, teamOneBans, teamTwoBans){
    // Team array format
    // SummonerName | Summoner Id | Champion Name | Champion ID
    // Banned champ array format
    // Champion Name | Champion ID | Turn Pick
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
} // End liveGameInfo(table, teamOne, teamTwo, teamOneBans, teamTwoBans)

// NAME: liveGameInfoTable(gameMode, gameId, gameStart, teamOne, teamTwo, teamOneBans, teamTwoBans)
// PURPOSE: Create the Table that would display a live game's information
// PARAMETERS: gameMode - The game mode being played
//             gameId - The game's ID which can be saved and retrieve data from Riot Games Support for heatmap data
//             gameStart - The time a game started at
//             teamOne - The first team in the game
//             teamTwo - The second team in the game
//             teamOneBans - The champions that teamOne bans in champion select
//             teamTwoBans - The champions that teamTwo bans in champion select
function liveGameInfoTable(gameMode, gameId, gameStart, teamOne, teamTwo, teamOneBans, teamTwoBans){
    let table = document.createElement("Table");
    table.id = "dataTable";
    table.cellPadding = '10 px';

    liveGameStats(table, gameStart, gameMode); // Add all the live game stat labels
    liveGameInfo(table, teamOne, teamTwo, teamOneBans, teamTwoBans); // Add all the data to the table
    liveGameHeaders(table, gameId); // Add all the headers to the table
    document.body.append(table); // Display the data

    // Keep the table at the center of the page
    let centerTable = () => {
        table.style.margin = "auto";
    }
    centerTable();
    window.addEventListener('resize', centerTable);
} // End liveGameInfoTable(gameMode, gameId, gameStart, teamOne, teamTwo, teamOneBans, teamTwoBans)

// NAME: liveGameHeaders(table, gameId)
// PURPOSE: Add the headers into the table that will display live game information
// PARAMETERS: table - The table that will display the live game information
function liveGameHeaders(table, gameId){
    let headers = ["Bans", "Pick Order", "Summoner", "Champion", "Champion", "Summoner", "Pick Order", "Bans"];
    let teamHeader = table.createTHead();
    teams = teamHeader.insertRow();
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
} // End liveGameHeaders(table, gameId)

// NAME: liveGameDetails(findByKey, gameData)
// PURPOSE: Create the multidimensional arrays that will hold the live game data for each summoner
// PARAMETERS: findByKey - Method of identifying champions by using champion ID to retrieve name
//             gameData - json file from the Riot Games API that contains a live game's data
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
    // If there is no table currently displayed, display one with a summoner's live game data
    if(!tableMade)
        liveGameInfoTable(gameMode, gameId, gameStart, teamOne, teamTwo, teamOneBans, teamTwoBans);
    tableMade = true; // There is a data table present that needs to be cleared before loading the next table can be displayed
} // End liveGameDetails(findByKey, gameData)

// NAME: liveGameCheck(findByKey, data)
// PURPOSE: Check if a player is currently in a game
// PARAMETERS: findByKey - Method of identifying champions by using champion ID to retrieve name
//             id - A summoner's encrypted summoner ID
async function liveGameCheck(findByKey, id){
    let url = "https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" + id + "?api_key=" + key;
    let gameData;
    try{
        let live = await fetch(url);
        gameData= await live.json();
        liveGameDetails(findByKey, gameData);
    }catch{
        alert("Player is not currently in a match right now.");
    }
} // End liveGameCheck(findByKey, data)

// NAME: searchPlayer(findByKey, id)
// PURPOSE: Fetches a player's champion mastery data, builds a multidimensional array to contain it, and then calls
//          the masteryInfoTable function to sort and display the information
// PARAMETERS: findByKey - Method of identifying champions by using champion ID to retrieve name
//             id - A summoner's encrypted summoner ID
async function searchPlayer(findByKey, id){
    // Retrieve champion mastery for this summoner
    let champMastery = await fetchChampMastery(id);
    let fetchTotalMastery = await fetch("https://na1.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/" + id + "?api_key=" + key);
    let totalMastery = await fetchTotalMastery.json();
    // Create an array to contain all champion info for this summoner
    champInfo = formatedChampionMastery(champMastery, findByKey);
    // If there is no table currently displayed, display one with a summoner's champion mastery data
    if(!tableMade)
        masteryInfoTable(champInfo, totalMastery);
    tableMade = true; // There is a data table present that needs to be cleared before loading the next table can be displayed
} // End searchPlayer(findByKey, id)

// NAME: main()
// PURPOSE: Get all champion data for this version of League of Legends, define a findByKey function that can
//          identify a champion by their ID, and then retrieve a summoner's data by the Summoner Name input
//          by the user. Once a valid user is found, display champion mastery data or live game data as requested
//          by the user
async function main(){
    // All champion data
    let championData = await fetch(version);
    let champData = await championData.json();
    let findByKey = (matchKey) => Object.entries(champData.data).find(([key, value]) => value.key == matchKey);

    // Get the summoner's account information needed for all following methods
    let data = await fetchSumByName();

    // Get general summoner mastery information
    if(playerSearch)
        searchPlayer(findByKey, data.id);
    if(liveGame)
        liveGameCheck(findByKey, data.id);
} // End main()

// NAME: newSearch()
// PURPOSE: Check if the user wants to search up a summoner's champion mastery
function newSearch(){
    // Checks to see if a table has already been displayed, and if so, remove it
    if(tableMade){
        let data = document.getElementById("dataTable");
        data.remove();
        tableMade = false;
    }
    playerSearch = true;
    liveGame = false;
    main();
} // End newSearch()

// NAME: newLiveGame()
// PURPOSE: Check if a user wants to search up a summoner's live game
function newLiveGame(){
    // Checks to see if a table has already been displayed, and if so, remove it
    if(tableMade){
        let data = document.getElementById("dataTable");
        data.remove();
        tableMade = false;
    }
    playerSearch = false;
    liveGame = true;
    main();
} // End newLiveGame()

// If the user presses enter after inputting a Summoner Name
let input = document.getElementById("searchName");
input.addEventListener("keypress", function(event){
    if(event.key === "Enter"){
        event.preventDefault();
        document.getElementById("search").click();
    }
})
