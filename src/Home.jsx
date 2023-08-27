
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {

    const navigate = useNavigate();

    return (
        <div className="Home">
            <div>
            </div>
            <h1>Play By Play</h1>
            <p>
                Want more than just a box score?
                <div className="button">
                    <button className="button" onClick={() => { navigate('/Search') }}>
                        Try Me!
                    </button>
                </div>
            </p>
            <img src={"https://aranceei.sirv.com/Images/nfl.jpg"} className="logo" />
            <p className="caption">
                Photo by Adrian Curiel on Unsplash
            </p>
        </div>
    )
}

export default Home;