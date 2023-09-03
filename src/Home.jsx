
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {

    const navigate = useNavigate();

    return (
        <div className="Home">
            <h1 className="Header">Play By Play</h1>
            <p className="subtext">
                Want more than just a box score?
            </p>
            <div className="button">
                <button className="button" onClick={() => { navigate('/Search') }}>
                    Discover meaningful insights derived from analyzing NFL play-by-play data
                </button>
            </div>
            <img src={"https://aranceei.sirv.com/Images/nfl.jpg"} className="logo" />
            <p className="caption">
                Photo by Adrian Curiel on Unsplash
            </p>
        </div>
    )
}

export default Home;