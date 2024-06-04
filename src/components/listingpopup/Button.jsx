import { useNavigate } from "react-router-dom"; 
import './Button.css'; 

function ListingButton() {
    const navigate = useNavigate(); 

    const goToListingPage = () => {
        navigate('/listing');
    }; 

    return (
        <div className='listing-button'>
            <button onClick={goToListingPage}>+ New Listing</button>
        </div>
    );
}

export default ListingButton;
