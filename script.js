let key = "RGAPI-846b0e77-b5b9-43d8-b862-6d274ff2165a";

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
    let table = document.createElement("table");
    table.style.textAlign = 'center';
    for(let i = 0; i < info.length; i++){
        let data = table.insertRow(i);
        data.insertCell(0).innerHTML = info[i][0];
        data.insertCell(1).innerHTML = info[i][1];
        data.insertCell(2).innerHTML = info[i][2];
        if(i % 2 == 0)
        data.style.backgroundColor = "#CCCDCD";
    }
    let header = table.createTHead();
    row = header.insertRow();
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
        // Store champ information in the format:
        // champName | champLevel | champPoints
        champInfo.push([findByKey(champ.championId)[1].name, champ.championLevel, champ.championPoints]);
    });
    return champInfo;
}

async function main(){
    // All champion data
    let championData = await fetch("http://ddragon.leagueoflegends.com/cdn/13.1.1/data/en_US/champion.json");
    let champData = await championData.json();
    let findByKey = (matchKey) => Object.entries(champData.data).find(([key, value]) => value.key == matchKey);

    // Prompt the user for the summoner name
    let name = "Kanan Matsuura";
    // Get the summoner's account information needed for all following methods
    let data = await fetchSumByName(name);
    // Retrieve champion mastery for this summoner
    let champMastery = await fetchChampMastery(data.id);
    // Create an array to contain all champion info for this summoner
    champInfo = formatedChampionMastery(champMastery, findByKey);
    // Create a table of information from the champ Mastery information
    infoTable(champInfo);
    console.log("We are here");
    console.log(data);
}

main();