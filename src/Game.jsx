import React, { useState, useEffect } from 'react';
import { getGameResult, getDriveInfo, analyze, NO_PLAY_BY_PLAY } from './parser';
import './Game.css';
import Dropdown from './dropdown';
import { useParams } from 'react-router-dom';


function Game() {
    const { gameID } = useParams();
    const [result, setResult] = useState('No Result');
    const [driveInfo, setDriveInfo] = useState('No Drive Info');
    const [analysis, setAnalysis] = useState('No Analysis');
    const [team1, setTeam1] = useState(null);
    const [team2, setTeam2] = useState(null);
    const [awayTeam, setAwayTeam] = useState(null);

    useEffect(() => {
        fetchResult();
        fetchDriveInfo();
    }, []);

    const fetchResult = async () => {
        const res = (await getGameResult(gameID));
        setResult(res[0]);
        setAwayTeam(res[1]);
    };

    const fetchDriveInfo = async () => {
        setDriveInfo((await getDriveInfo(gameID)));
    };

    const fetchAnalysis = async () => {
        setAnalysis((await analyze(driveInfo)));
    };

    useEffect(() => {
        fetchAnalysis();
    }, [driveInfo]);

    useEffect(() => {
        let swap = true;
        if (analysis[0].Abbreviations)
            analysis[0].Abbreviations.forEach((abr) => {
                if (abr === awayTeam)
                    swap = false;
            });
        if (!swap) {
            setTeam1(analysis[0]);
            setTeam2(analysis[1]);
        } else {
            setTeam1(analysis[1]);
            setTeam2(analysis[0]);
        }
    }, [analysis, awayTeam]);

    if (driveInfo === NO_PLAY_BY_PLAY) {
        return (
            <div>
                <h2>{"Sorry, There's No Play By Play Data Available On This Game"}</h2>
            </div>
        )
    }
    else return !(result && team1 && team2) ? (
        <div className="Loader"></div>
    ) : (
        <div>
            <h1>{result}</h1>
            <div className="dropdown-container">
                <Dropdown header={team1.Name} info={team1} />
                <Dropdown header={team2.Name} info={team2} />
            </div>
            <p className="caption">
                Discrepancies may arise due to inconsistencies in the play-by-play data available for this game.
            </p>
        </div>
    );
}

export default Game;
