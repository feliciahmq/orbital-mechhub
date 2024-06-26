import { useNavigate } from "react-router-dom"; 
import React from "react";

import "./LandingBanner.css";


function Banner() {
	const navigate = useNavigate(); 

	const viewProducts = () => {
		navigate('/search'); 
	};

  return (
	<div className="banner">
		<div>
			<h1>My Keyboard Quit Its Job</h1>
			<p>
				— apparently, it wasn't getting enough 'shift' work!
			</p>
			<button onClick={viewProducts} className='button-go-brr'>View All Products</button>
		</div>
	</div>
  );
}

export default Banner;