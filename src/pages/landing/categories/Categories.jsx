import "./Categories.css";
import MH_sample from "../../../assets/Logo/MH_logo.png";

const categories = [
  {
    id: 1,
    name: "Switches",
    image: MH_sample,
  },
  {
    id: 2,
    name: "Cat 2",
    image: MH_sample,
  },
  {
    id: 3,
    name: "Cat 3",
    image: MH_sample,
  },
  {
    id: 4,
    name: "Cat 4",
    image: MH_sample,
  },
  {
    id: 5,
    name: "Cat 5",
    image: MH_sample,
  },
  {
    id: 6,
    name: "Cat 6",
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