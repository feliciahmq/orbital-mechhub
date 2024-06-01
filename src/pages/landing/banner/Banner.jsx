import ProductImg from "../../../assets/Product-Images/ditto_eg.png";
import "./Banner.css";
import { useNavigate } from "react-router-dom"; 

function Banner() {
  const navigate = useNavigate(); 

  const viewProducts = () => {
    navigate('/product'); 
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
        <button onClick={viewProducts}>View Now</button>
      </div>
      <img src={ProductImg} alt="ProductImg" />
    </div>
  );
}

export default Banner;