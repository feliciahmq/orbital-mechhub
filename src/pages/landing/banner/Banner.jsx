import ProductImg from "../../../assets/Product-Images/ditto_eg.png";
import "./Banner.css";

function Banner() {
  return (
    <div className="banner">
      <div>
        <h1>KeyBoards</h1>
        <p>
          Testing testing 123..................
          <br />
          whee test test 123
        </p>
        <button>View Now</button>
      </div>
      <img src={ProductImg} alt="ProductImg" />
    </div>
  );
}

export default Banner;