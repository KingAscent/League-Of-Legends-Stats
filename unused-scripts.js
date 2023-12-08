/*
    None of these are functional or reusable. 
*/

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

/* TABLE STYLES IN JAVASCRIPT
table.style.textAlign = 'center';
table.style.border = '1px solid black';
table.style.backgroundColor = '#13008B'; // Table background
table.style.color = 'white'; // Text color
*/
