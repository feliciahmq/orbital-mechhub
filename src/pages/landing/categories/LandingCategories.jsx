import "./LandingCategories.css";
import MH_sample from "../../../assets/Logo/MH_logo.png";

const categories = [
  {
    id: 1,
    name: "Full Builds",
    image: MH_sample,
  },
  {
    id: 2,
    name: "Keycaps",
    image: MH_sample,
  },
  {
    id: 3,
    name: "Switches",
    image: MH_sample,
  },
  {
    id: 4,
    name: "Stabilisers",
    image: MH_sample,
  },
  {
    id: 5,
    name: "Deskmats",
    image: MH_sample,
  },
  {
    id: 6,
    name: "Cables",
    image: MH_sample,
  },
  {
    id: 7,
    name: "Group Orders",
    image: MH_sample,
  },
  {
    id: 8,
    name: "Others",
    image: MH_sample,
  },
];

function Categories() {
  return (
    <>
    <h2>Categories</h2>
      <ul className="categories">
        {categories.map((category) => (
          <li key={category.id}>
            <div className="image-container">
              <img src={category.image} />
            </div>
            <div className="title">{category.name}</div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Categories;