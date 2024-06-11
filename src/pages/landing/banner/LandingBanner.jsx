import { useNavigate } from "react-router-dom"; 

import ProductImg from "../../../assets/Product-Images/ditto_eg.png";
import "./LandingBanner.css";


function Banner() {
  const navigate = useNavigate(); 

  const viewProducts = () => {
    navigate('/search'); 
  };

  return (
    <div className="banner">
      <div>
        <h1>KeyBoards</h1>
        <p>
          Testing testing 123..................
          <br />
          whee test test 123
        </p>
        <button onClick={viewProducts} className='button-go-brr'>View Now</button>
      </div>
      <img src={ProductImg} alt="ProductImg" />
    </div>
  );
}

export default Banner;