let key = "RGAPI-00004247-ec7e-4803-919d-433095438f67";

async function fetchSumByName(name){
    // Get summoner information from Riot Games API
    let url = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + name + "?api_key=" + key;
    let res = await fetch(url)
    // Turn the response into a json and return it
    let data = await res.json();
    return data;
}

async function fetchChampMastery(id){
    let url = "https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" + id + "?api_key=" + key;
    let res = await fetch(url);
    // Turn the response into a json and return it
    let data = await res.json();
    return data;
}

function infoTable(info){
    let headers = ["Champion", "Mastery Level", "Mastery Points"];
    let table = document.createElement("Table");
    for(let i = 0; i < info.length; i++){
        let data = table.insertRow(i);
        data.insertCell(0).innerHTML = info[i][0];
        data.insertCell(1).innerHTML = info[i][1];
        data.insertCell(2).innerHTML = info[i][2];
    }
    let header = table.createTHead();
    row = header.insertRow();
    for(let i = 0; i < headers.length; i++){
        row.insertCell(i).innerHTML = headers[i];
    }
    document.body.append(table);
}

async function main(){
/*
    // Get champions in the format: name | ID
    let championData = await fetch("http://ddragon.leagueoflegends.com/cdn/13.1.1/data/en_US/champion.json");
    let champData = await championData.json();
    let champID = Array(champData.length).fill("empty");
    // Retrieve each champion's name through their championID, and replace champID with it
    for(let i = 0; i < champData.length; i++){
        let champ = champData.data;
        
    }
    console.log(champData.data);
*/

    // Prompt the user for the summoner name
    let name = "Kanan Matsuura";
    // Get the summoner's account information needed for all following methods
    let data = await fetchSumByName(name);
    console.log(data);
    // Retrieve champion mastery for this summoner
    let champMastery = await fetchChampMastery(data.id);
    // Create an array to contain all champion info
    champInfo = [];
    champMastery.forEach(champ => {
        // Store champ information in the format:
        // champID | champLevel | champPoints
        champInfo.push([champ.championId, champ.championLevel, champ.championPoints]);
    });
    // Create a table of information from the champ Mastery information
    infoTable(champInfo);
    console.log("We are here");
}

main();