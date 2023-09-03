import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import './Search.css';
import { getGameHeader, BACKEND } from './parser';
import { useNavigate } from 'react-router-dom';

function Search() {
    const navigate = useNavigate();
    const [gameIDs, setGameIDs] = useState([]);
    const [gameHeaders, setGameHeaders] = useState({});
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
        // Populate gameHeaders map with gameIDs as keys and results as values
        const populateGameHeaders = async () => {
            const newGameResults = new Map();
            for (const gameID of gameIDs) {
                const gameHeader = await getGameHeader(gameID);
                newGameResults.set(gameID, gameHeader);
            }
            setGameHeaders(newGameResults);
            setLoading(false);
        };
        populateGameHeaders();
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
            <div className="SubText">
                <p>Search for any slate of regular season NFL games dating back to 2001</p>
            </div>
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
                            <button className="Matchup" onClick={() => {
                                window.open(`/${gameID}`, '_blank');
                            }}>
                                {gameHeaders.get(gameID)}
                            </button>
                        </li>
                    ))}
                </ul>

            )}
        </div>
    );
}

export default Search;