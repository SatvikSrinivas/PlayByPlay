import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import './Search.css';
import { getGameResult, BACKEND } from './parser';

function Search() {
    const [gameIDs, setGameIDs] = useState([]);
    const [gameResults, setGameResults] = useState({});
    const [year, setYear] = useState('');
    const [week, setWeek] = useState('');
    const [loading, setLoading] = useState(false);

    const handleYearChange = (event) => {
        setYear(event.target.value);
    };

    const handleWeekChange = (event) => {
        setWeek(event.target.value);
    };

    const fetchGames = async () => {
        setGameIDs([]);
        setLoading(true);
        try {
            const { games } = await getGameIDs();
            setGameIDs(games);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // when gameIDs changes update gameResults
    useEffect(() => {
        setLoading(true);
        // Populate gameResults map with gameIDs as keys and results as values
        const populateGameResults = async () => {
            const newGameResults = new Map();
            for (const gameID of gameIDs) {
                const gameResult = await getGameResult(gameID);
                newGameResults.set(gameID, gameResult);
            }
            setGameResults(newGameResults);
            setLoading(false);
        };
        populateGameResults();
    }, [gameIDs]);

    async function getGameIDs() {
        try {
            const response = await axios.get(BACKEND + `/slate/${year}/${week}`);
            const $ = cheerio.load(response.data);
            const games = [];

            $('a.AnchorLink').each((index, element) => {
                const href = $(element).attr('href');
                const match = href.match(/nfl\/game\?gameId=(\d+)$/);
                if (match) {
                    games.push(match[1]);
                }
            });

            return { week, games };
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    return (
        <div>
            <h1>Search</h1>
            <div className="Container">
                Year:
                <input className="TextInput"
                    type="text"
                    placeholder="Year"
                    value={year}
                    onChange={handleYearChange}
                />
                Week:
                <input className="TextInput"
                    type="text"
                    placeholder="Week"
                    value={week}
                    onChange={handleWeekChange}
                />
                <button className="search-button" onClick={fetchGames}>
                    Search
                </button>
            </div>
            {loading ? (
                <div className="Loader"></div>
            ) : (
                <ul className="TwoColumnList">
                    {gameIDs.map(gameID => (
                        <li key={gameID} className="Matchup">
                            <a href={`https://www.espn.com/nfl/playbyplay/_/gameId/${gameID}`} target="_blank" rel="noopener noreferrer"
                                className="Matchup">
                                {gameResults.get(gameID)}
                            </a>
                        </li>
                    ))}
                </ul>

            )}
        </div>
    );
}

export default Search;