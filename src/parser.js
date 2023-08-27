import axios from 'axios';

const PRODUCTION = true;
export const BACKEND = PRODUCTION ? 'https://playbyplay-backend.onrender.com' : ".";

export const getGameResult = async (gameID) => {
    try {
        const response = await axios.get(BACKEND + '/game/' + gameID);
        const playByPlayData = response.data;
        const resultIndex = playByPlayData.indexOf('<title data-react-helmet="true">') + '<title data-react-helmet="true">'.length;
        let result = playByPlayData.substring(resultIndex, playByPlayData.indexOf("(", resultIndex));
        let resultArr = result.split('-');
        let awayScore = resultArr[0].substring(resultArr[0].lastIndexOf(' ') + 1);
        let homeScore = resultArr[1].substring(0, resultArr[1].indexOf(' '));
        let homeTeamIndex = playByPlayData.indexOf('"home":') + '"home":'.length;
        homeTeamIndex = playByPlayData.indexOf('"abbrev":"', homeTeamIndex) + '"abbrev":"'.length;
        const homeTeam = playByPlayData.substring(homeTeamIndex, playByPlayData.indexOf('"', homeTeamIndex));
        let awayTeamIndex = playByPlayData.indexOf('"away":') + '"away":'.length;
        awayTeamIndex = playByPlayData.indexOf('"abbrev":"', awayTeamIndex) + '"abbrev":"'.length;
        const awayTeam = playByPlayData.substring(awayTeamIndex, playByPlayData.indexOf('"', awayTeamIndex));
        return awayScore + " " + awayTeam + " @ " + homeTeam + " " + homeScore;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}