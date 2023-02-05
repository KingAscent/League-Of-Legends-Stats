/*
RGAPI-107bc540-5139-42df-b3ab-c8130df07fc4
const rgkey = 'api_key = RGAPI-107bc540-5139-42df-b3ab-c8130df07fc4';
const personalKey = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/Vinmai?api_key=RGAPI-107bc540-5139-42df-b3ab-c8130df07fc4'
const space = '$20';
*/

async function fetchSumByName(name){
    // Get summoner information from Riot Games API
    let url = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + name + "?api_key=RGAPI-107bc540-5139-42df-b3ab-c8130df07fc4";
    let res = await fetch(url)
    // Turn the response into a json and return it
    let data = await res.json();
    return data;
}

async function fetchChampMastery(id){
    let url = "https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" + id + "?api_key=RGAPI-107bc540-5139-42df-b3ab-c8130df07fc4";
    let res = await fetch(url);
    // Turn the response into a json and return it
    let data = await res.json();
    return data;
}

async function main(){
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
    
    console.log("We are here");
}

main();