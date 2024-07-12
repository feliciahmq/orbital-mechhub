import React from "react";
import ForumCards from "./ForumCards";

function ForumList({ heading, forums, descriptionLength }) {
    return (
        <>
            <h2>{heading}</h2>
            <div className="forum-list">
                {forums.map(forumDetail => (
                    <ForumCards key={forumDetail.id} forumDetail={forumDetail} descriptionLength={descriptionLength} />
                ))}
            </div>
        </>
    );
}
  
export default ForumList;