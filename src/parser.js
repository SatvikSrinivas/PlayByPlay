import axios from 'axios';
import { teamNameMap } from './teamNameMap.js';

const PRODUCTION = true;
export const BACKEND = PRODUCTION ? 'https://playbyplay-backend.onrender.com' : ".";

export const getGameHeader = async (gameID) => {
    try {
        const response = await axios.get(BACKEND + '/game/' + gameID);
        const playByPlayData = response.data;
        const resultIndex = playByPlayData.indexOf('<title data-react-helmet="true">') + '<title data-react-helmet="true">'.length;
        let result = playByPlayData.substring(resultIndex, playByPlayData.indexOf("(", resultIndex));
        if (!result.includes('-'))
            return result; // Game hasn't been played yet
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

export const getGameResult = async (gameID) => {
    try {
        const response = await axios.get(BACKEND + '/game/' + gameID);
        const playByPlayData = response.data;
        const resultIndex = playByPlayData.indexOf('<title data-react-helmet="true">') + '<title data-react-helmet="true">'.length;
        let result = playByPlayData.substring(resultIndex, playByPlayData.indexOf("(", resultIndex));
        let resultArr = result.split('-');
        if (!result.includes('-'))
            return [result, "awayTeam"];  // Game hasn't been played yet
        let awayScore = resultArr[0].substring(resultArr[0].lastIndexOf(' ') + 1);
        let homeScore = resultArr[1].substring(0, resultArr[1].indexOf(' '));
        let homeTeamIndex = playByPlayData.indexOf('"home":') + '"home":'.length;
        homeTeamIndex = playByPlayData.indexOf('"abbrev":"', homeTeamIndex) + '"abbrev":"'.length;
        const homeTeam = playByPlayData.substring(homeTeamIndex, playByPlayData.indexOf('"', homeTeamIndex));
        let awayTeamIndex = playByPlayData.indexOf('"away":') + '"away":'.length;
        awayTeamIndex = playByPlayData.indexOf('"abbrev":"', awayTeamIndex) + '"abbrev":"'.length;
        const awayTeam = playByPlayData.substring(awayTeamIndex, playByPlayData.indexOf('"', awayTeamIndex));
        return [awayScore + " " + awayTeam + " @ " + homeTeam + " " + homeScore, awayTeam];
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export const NO_PLAY_BY_PLAY = 'No Play-by-Play Available';
const endTokens = ['END GAME', 'scrSumm'];
export const getDriveInfo = async (gameID) => {
    try {
        const response = await axios.get(BACKEND + '/game/' + gameID);
        const playByPlayData = response.data;

        const allPlysIndex = playByPlayData.indexOf('allPlys');

        if (playByPlayData.indexOf(NO_PLAY_BY_PLAY) > -1) {
            console.log(NO_PLAY_BY_PLAY);
            return NO_PLAY_BY_PLAY;
        }
        else if (allPlysIndex !== -1) {
            let endGameIndex = -1, endTokensIndex = 0;
            while (endGameIndex === -1 && endTokensIndex < endTokens.length)
                endGameIndex = playByPlayData.indexOf(endTokens[endTokensIndex++], allPlysIndex);

            if (endGameIndex !== -1) {
                const extractedPart = playByPlayData.substring(allPlysIndex, endGameIndex);
                const modifiedPart = extractedPart.replace(/"id":/g, '\n"id":');
                const linesArray = modifiedPart.split('\n');
                const subarrays = [];
                let currentSubarray = [];

                for (const line of linesArray) {
                    if (line.includes('plays,') || line.includes('play,')) {
                        if (currentSubarray.length > 0)
                            subarrays.push(currentSubarray);
                        currentSubarray = [];
                    }
                    currentSubarray.push(line);
                }

                if (currentSubarray.length > 0)
                    subarrays.push(currentSubarray);

                subarrays.shift();
                return subarrays;
            } else {
                console.log("Could not identify end of game");
            }
        } else {
            console.log("'allPlys' not found in the play-by-play data");
            return NO_PLAY_BY_PLAY;
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


function getTeamName(driveHeader) {
    const start = driveHeader.indexOf('teamName":"') + 'teamName":"'.length;
    return driveHeader.substring(start, driveHeader.indexOf('","', start));
}

function format(input) {
    return (Math.round(100 * input) / 100).toFixed(2);
}

function calculateAvgs(team) {
    let t;
    for (let i = 0; i < downs.length; i++) {
        t = team.Down[downs[i]];
        if (t.Plays > 0)
            t.avgDist = format(t.dist / t.Plays);
        if (t.Plays > 0)
            t.avgGain = format(t.Yards / t.Plays);
        if (t.Rush > 0)
            t.avgRush = format(t['Rush Yards'] / t.Rush);
        if (t.Pass > 0)
            t.avgPass = format(t['Pass Yards'] / t.Pass);
    }
    for (let i = 0; i < quarters.length; i++) {
        t = team.Quarter[quarters[i]];
        if (t.Plays > 0)
            t.avgDist = format(t.dist / t.Plays);
        if (t.Plays > 0)
            t.avgGain = format(t.Yards / t.Plays);
        if (t.Rush > 0)
            t.avgRush = format(t['Rush Yards'] / t.Rush);
        if (t.Pass > 0)
            t.avgPass = format(t['Pass Yards'] / t.Pass);
    }
}

function getDistance(arr, brr) {
    if (arr[0] === 'OPP')
        arr[1] = 100 - parseInt(arr[1]);
    if (brr[0] === 'OPP')
        brr[1] = 100 - parseInt(brr[1]);
    return brr[1] - arr[1];
}

function netChangeInYardage(play, team) {
    const endIndex = play.indexOf('."}');
    let arr, brr;

    if (endIndex === -1) {
        const atIndex = play.indexOf(' at ') + ' at '.length, commaIndex = play.indexOf('","'),
            toIndex = play.lastIndexOf(' to ') + ' to '.length, forIndex = play.lastIndexOf(' for ');
        arr = play.substring(atIndex, commaIndex).split(" ");
        brr = play.substring(toIndex, forIndex).split(" ");

        if (play.includes(OFFENSIVE_HOLDING) && !isPass(play)) {
            const l = play.lastIndexOf('."}');
            brr = play.substring(play.lastIndexOf(' at ', l) + ' at '.length, l).split(" ");
        }
    } else {
        if (play.includes('SAFETY')) {
            // Sack --> Fumble --> Safety : 2nd & 8 at WSH -4","isPlayHeader":false,"description":"(3:17 - 1st) (Shotgun) C.Wentz sacked at WAS -4 for -9 yards (C.Harris). FUMBLES (C.Harris) [C.Harris], touched at WAS -7, ball out of bounds in End Zone, SAFETY."}]
            return play.substring(play.indexOf(' for ') + ' for '.length, play.indexOf(' yards '));
        }
        const playStartIndex = Math.max(0, play.lastIndexOf('Officially'));
        play = play.substring(playStartIndex, endIndex + '."}'.length);

        let a1, a2, startStr, endStr;
        if (playStartIndex === 0) {
            // looking for ' to ' in 2023 games else default is ' at '
            a1 = play.indexOf(' at ');
            a2 = Math.max(play.lastIndexOf(' to '), play.lastIndexOf(' at '));
            const r = play.indexOf('RECOVERED');
            if (r > -1) {
                // K.Cousins sacked at MIN 18 for -8 yards (J.Sweat). FUMBLES (J.Sweat) [J.Sweat], RECOVERED by PHI-F.Cox at MIN 15. F.Cox to MIN 7 for 8 yards (E.Ingram)."
                a2 = play.indexOf(' at ', r);
            }
            startStr = play.substring(a1 + ' at '.length, play.indexOf('","', a1));
            endStr = play.substring(a2 + ' at '.length, endIndex);
        } else {
            // Play includes 'Officially'
            const yardEndIndex = play.lastIndexOf(' yards');
            let yardStatement = play.substring(play.lastIndexOf(' ', yardEndIndex - 1) + 1, yardEndIndex);
            if (play.includes('sack') && parseInt(yardStatement) > 0)
                return '-' + yardStatement;
            return yardStatement;
        }
        arr = startStr.split(" ");
        brr = endStr.split(" ");
    }

    // Handle midfield (at 50)
    if (arr.length === 1)
        arr = ['OWN', 50];
    if (brr.length === 1)
        brr = ['OWN', 50];

    if (team.Abbreviations.includes(arr[0]))
        arr[0] = 'OWN';
    else
        arr[0] = 'OPP';
    if (team.Abbreviations.includes(brr[0]))
        brr[0] = 'OWN';
    else
        brr[0] = 'OPP';

    return getDistance(arr, brr);
}

// Key Tokens:
const disqualifiers = ['Kickoff', 'kickoff', ' kicks ', ' Kick)', ' Punt ', ' punts ', ' field goal ', ' Field Goal ', 'timeout; ',
    ' penalty ', 'quarter.', ' 2 minute warning.', 'No Play', 'Yd Field Goal'];
const yardTokens = [' yards ', ' yards,', ' yard ', ' yard,', ' Yard ', ' Yds ', ' Yd ', ' yards.', ' Yrds ', ' Yrd ', ' yard.', ' yard; '];
const passTokens = [' pass ', ' Pass ', ' intercepted ', 'INTERCEPTED', ' Interception ', 'sacked'];
const downs = ['1st', '2nd', '3rd', '4th'];
const quarters = [...downs, 'OT'];
const interceptionTokens = [' intercepted ', 'INTERCEPTED', ' Interception '];
const OFFENSIVE_HOLDING = ' Offensive Holding, 10 yards, enforced at ';

function checkTokens(play, tokens) {
    // if any of the tokens satisfies the condition, some() will return true else false
    return tokens.some(token => play.includes(token));
}

function isPass(play) {
    return checkTokens(play, passTokens);
}

function isInterception(play) {
    return checkTokens(play, interceptionTokens);
}

function includesYardToken(play) {
    return checkTokens(play, yardTokens);
}

function isPlayFromScrimmage(play) {
    return includesYardToken(play) || isPass(play) || isInterception(play) || play.includes('gain');
}

function isProblematicFumble(play) {
    return play.includes(' fumble ') && !play.includes(' The Replay Assistant challenged the fumble ruling, and the play was REVERSED.')
}

export const analyze = async (driveInfo) => {
    const name1 = getTeamName(driveInfo[0][0]);
    let name2 = name1;

    // Determine name2
    let name2_index = 0;
    while (name1 === name2)
        name2 = getTeamName(driveInfo[name2_index++][0]);

    const team1 = {
        "Name": name1,
        "Abbreviations": teamNameMap[name1],
        "Down": {
            "1st":
            {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "2nd": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "3rd": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "4th": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
        },
        "Quarter": {
            "1st":
            {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "2nd": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "3rd": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "4th": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "OT": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
        }
    };
    const team2 = {
        "Name": name2,
        "Abbreviations": teamNameMap[name2],
        "Down": {
            "1st": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "2nd": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "3rd": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "4th": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
        },
        "Quarter": {
            "1st": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "2nd": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "3rd": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "4th": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
            "OT": {
                "Plays": 0, "dist": 0, "Yards": 0, "Rush": 0, "Rush Yards": 0, "Pass": 0, "Pass Yards": 0, "Shotgun": 0, "No Huddle": 0,
                "left end": 0, "left tackle": 0, "left guard": 0, "up the middle": 0, "right guard": 0, "right tackle": 0, "right end": 0, "kneels": 0,
                "short left": 0, "short middle": 0, "short right": 0, "deep left": 0, "deep middle": 0, "deep right": 0, "sacked": 0, "unspecifiedRush": 0, "unspecifiedPass": 0,
            },
        }
    };
    let currentTeam;

    for (let i = 0; i < driveInfo.length; i++) {
        if (getTeamName(driveInfo[i][0]) === team1.Name)
            currentTeam = team1;
        else
            currentTeam = team2;

        for (let j = 0; j < driveInfo[i].length; j++) {
            let currentPlay = driveInfo[i][j];

            let dqIndex = 0, disqualified = false;
            while (dqIndex < disqualifiers.length)
                if (currentPlay.includes(disqualifiers[dqIndex++])) {
                    disqualified = true;
                    break;
                }

            let parseYardsFromFront = false;

            // Moved parseYardsFromFront logic outside of disqualified block and added ' RECOVERED ' (DAL @ NYG fix 09.11.2023)
            if (currentPlay.includes(' Pass From ') || currentPlay.includes(' RECOVERED '))
                parseYardsFromFront = true;

            if (disqualified) {
                let SAFE = false;
                if ((currentPlay.includes(' Kick)') && !currentPlay.includes(' Fumble Return ')))
                    SAFE = true;
                if (!SAFE)
                    continue;
            }

            let a = currentPlay.indexOf('&');
            if (a > -1) {
                // Down & Distance
                let down = currentPlay.substring(a - 4, a - 1);
                let dist_startIndex = currentPlay.indexOf(" ", a) + 1, dist_endIndex = currentPlay.indexOf(" ", dist_startIndex);
                let dist = currentPlay.substring(dist_startIndex, dist_endIndex);
                if (dist === 'Goal') {
                    let distToGoalLine_end = currentPlay.indexOf('","isPlayHeader'), distToGoalLine_start = currentPlay.lastIndexOf(" ", distToGoalLine_end);
                    dist = currentPlay.substring(distToGoalLine_start, distToGoalLine_end);
                }

                // Quarter
                const q = currentPlay.indexOf(' - ') + ' - '.length;
                const quarter = currentPlay.substring(q, currentPlay.indexOf(')', q));

                if (!downs.includes(down))
                    continue; // not an actual play from scrimmage; i.e.: kickoff or two-minute warning, etc...

                if (currentPlay.includes(' Timeout #') && !isPlayFromScrimmage(currentPlay))
                    continue; // not an actual play just a timeout

                // Accumulate numPlays and dist
                currentTeam.Down[down].Plays++;
                currentTeam.Down[down].dist += parseInt(dist);
                currentTeam.Quarter[quarter].Plays++;
                currentTeam.Quarter[quarter].dist += parseInt(dist);

                // Accumulate Shotgun and No Huddle plays
                if (currentPlay.includes('Shotgun')) {
                    currentTeam.Down[down].Shotgun++;
                    currentTeam.Quarter[quarter].Shotgun++;
                }
                if (currentPlay.includes('No Huddle')) {
                    currentTeam.Down[down]['No Huddle']++;
                    currentTeam.Quarter[quarter]['No Huddle']++;
                }

                if (currentPlay.includes(' spiked the ball to stop the clock.'))
                    continue; // still counted in team play count but not for offensive stats

                // Determine Yards Gained (or Lost represented by a negative gain)
                let y = currentPlay.length, yardTokensIndex = 0;
                while (yardTokensIndex < yardTokens.length)
                    if (parseYardsFromFront) {
                        let index = currentPlay.indexOf(yardTokens[yardTokensIndex++]);
                        if (index === -1)
                            index = currentPlay.length;
                        y = Math.min(y, index);
                    } else {
                        y = currentPlay.lastIndexOf(yardTokens[yardTokensIndex++]);
                        if (y > -1)
                            break;
                    }

                let gain = 0;

                if (y > -1 && !isInterception(currentPlay)) {
                    gain = currentPlay.substring(currentPlay.lastIndexOf(' ', y - 1) + 1, y);
                    if ((currentPlay.includes(OFFENSIVE_HOLDING) && !isPass(currentPlay)) || currentPlay.includes(' Lateral ') || (currentPlay.includes('FUMBLES'))) {
                        // 'recovers' = self-recovery by fumbling player, 'recovered' = same team recovery, 'RECOVERED' = opposing team recovery
                        if (currentPlay.includes(' recovered ') && currentPlay.includes(' sacked ')) // if a sack fumble is advanced by the fumbling team, yards aren't added to offensive stats
                            gain = 0;
                        const prevGain = gain;
                        if (!currentPlay.includes('REVERSED')) // Crude bug fix but handles MIN @ PHI case of Jefferson fumble resulting in touchback 09.14.23
                            gain = Math.min(gain, netChangeInYardage(currentPlay, currentTeam));
                        if (isNaN(gain)) {
                            // Crude bug fix but handles errors in case of a Lateral that doesn't result in a fumble
                            gain = prevGain;
                        }
                    }
                }

                // NOTE: This is a crude fix for the time being but 'Aborted.' allows the Prescott pass to count while (Aborted) excludes the Huntley run
                if (!currentPlay.includes('(Aborted)')) {
                    if (currentPlay.includes(' sacked ') && gain > 0)
                        gain *= -1;

                    // Accumulate total gain ('advance.' indicates fumble was advanced not an offensive gain in yards)
                    if (!currentPlay.includes('advance.') && !isProblematicFumble(currentPlay)) {
                        currentTeam.Down[down].Yards += parseInt(gain);
                        currentTeam.Quarter[quarter].Yards += parseInt(gain);
                    }

                    // Accumulate passing and rushing gains
                    if (!currentPlay.includes(' Run ') && isPass(currentPlay)) {
                        if (currentPlay.includes('Intentional Grounding'))
                            gain = 0;

                        currentTeam.Down[down].Pass++;
                        currentTeam.Down[down]['Pass Yards'] += parseInt(gain);
                        currentTeam.Quarter[quarter].Pass++;
                        currentTeam.Quarter[quarter]['Pass Yards'] += parseInt(gain);

                        // Accumulate Pass Play Direction
                        if (currentPlay.includes('short left')) {
                            currentTeam.Down[down]['short left']++;
                            currentTeam.Quarter[quarter]['short left']++;
                        }
                        else if (currentPlay.includes('short middle')) {
                            currentTeam.Down[down]['short middle']++;
                            currentTeam.Quarter[quarter]['short middle']++;
                        }
                        else if (currentPlay.includes('short right')) {
                            currentTeam.Down[down]['short right']++;
                            currentTeam.Quarter[quarter]['short right']++;
                        }
                        else if (currentPlay.includes('deep left')) {
                            currentTeam.Down[down]['deep left']++;
                            currentTeam.Quarter[quarter]['deep left']++;
                        }
                        else if (currentPlay.includes('deep middle')) {
                            currentTeam.Down[down]['deep middle']++;
                            currentTeam.Quarter[quarter]['deep middle']++;
                        }
                        else if (currentPlay.includes('deep right')) {
                            currentTeam.Down[down]['deep right']++;
                            currentTeam.Quarter[quarter]['deep right']++;
                        }
                        else if (currentPlay.includes('sacked')) {
                            currentTeam.Down[down].sacked++;
                            currentTeam.Quarter[quarter].sacked++;
                        }
                        else if (currentPlay.includes('Pass From')) {
                            currentTeam.Down[down].unspecifiedPass++;
                            currentTeam.Quarter[quarter].unspecifiedPass++;
                        }
                    }
                    else { // NOTE: ' fumble ' is meaningfully different from 'FUMBLES', indicating not a run play
                        if (currentPlay.includes(' fumble ') && !isProblematicFumble(currentPlay))
                            continue;
                        currentTeam.Down[down].Rush++;
                        currentTeam.Down[down]['Rush Yards'] += parseInt(gain);
                        currentTeam.Quarter[quarter].Rush++;
                        currentTeam.Quarter[quarter]['Rush Yards'] += parseInt(gain);

                        // Accumulate Run Play Direction
                        if (currentPlay.includes('left end')) {
                            currentTeam.Down[down]['left end']++;
                            currentTeam.Quarter[quarter]['left end']++;
                        }
                        else if (currentPlay.includes('left tackle')) {
                            currentTeam.Down[down]['left tackle']++;
                            currentTeam.Quarter[quarter]['left tackle']++;
                        }
                        else if (currentPlay.includes('left guard')) {
                            currentTeam.Down[down]['left guard']++;
                            currentTeam.Quarter[quarter]['left guard']++;
                        }
                        else if (currentPlay.includes('up the middle')) {
                            currentTeam.Down[down]['up the middle']++;
                            currentTeam.Quarter[quarter]['up the middle']++;
                        }
                        else if (currentPlay.includes('right guard')) {
                            currentTeam.Down[down]['right guard']++;
                            currentTeam.Quarter[quarter]['right guard']++;
                        }
                        else if (currentPlay.includes('right tackle')) {
                            currentTeam.Down[down]['right tackle']++;
                            currentTeam.Quarter[quarter]['right tackle']++;
                        }
                        else if (currentPlay.includes('right end')) {
                            currentTeam.Down[down]['right end']++;
                            currentTeam.Quarter[quarter]['right end']++;
                        }
                        else if (currentPlay.includes('kneels')) {
                            currentTeam.Down[down]['kneels']++;
                            currentTeam.Quarter[quarter]['kneels']++;
                        }
                        else if (currentPlay.includes('Rush')) {
                            currentTeam.Down[down].unspecifiedRush++;
                            currentTeam.Quarter[quarter].unspecifiedRush++;
                        }
                    }
                }
            }
        }

        // Calculate Avgs
        calculateAvgs(team1);
        calculateAvgs(team2);
    }

    return [team1, team2];
}

