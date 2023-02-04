/*
RGAPI-430b27d2-ed43-49e8-bd64-56c2600bae20
const rgkey = 'api_key = RGAPI-430b27d2-ed43-49e8-bd64-56c2600bae20';
const personalKey = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/Vinmai?api_key=RGAPI-430b27d2-ed43-49e8-bd64-56c2600bae20'
const space = '$20';
*/

async function fetchSumByName(name, type){
    // Get summoner information from Riot Games API
    let url = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + name + "?api_key=RGAPI-430b27d2-ed43-49e8-bd64-56c2600bae20";
    let res = await fetch(url)

    // Turn the response into a json and return it
    let data = await res.json();
    
    return data;
}

async function main(){
    let data = await fetchSumByName("Kanan Matsuura");
    console.log(data);
    // Retrieve champion mastery for this summoner

    console.log("We are here");
}

main();