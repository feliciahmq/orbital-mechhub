import React, { useEffect, useState } from 'react';
import { auth, db } from '/src/lib/firebaseConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, addDoc, where, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../Auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

import Navbar from '../../components/navbar/Navbar';
import Format from '../../components/format/Format';
import ReviewList from './userReviews/ReviewList';
import EditPopup from './editUser/EditPopup';
import Header from '../../components/header/Header';
import ListingButton from '../../components/listingpopup/Button';
import ProductList from '../../components/productcards/ProductList';
import ForumList from '../../components/forumcards/ForumList';
import './UserProfile.css';

const defaultProfilePic = "/src/assets/defaultProfile.jpg"; 

function UserProfile() {
	const { userID } = useParams();
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const [userInfo, setUserInfo] = useState(null);
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [userListings, setUserListings] = useState([]);
	const [userReviews, setUserReviews] = useState([]);
	const [viewToggle, setViewToggle] = useState('listing');
	const [averageScore, setAverageScore] = useState(0);
	const [numberOfReviews, setNumberOfReviews] = useState(0);
	const [followUser, setFollowUser] = useState(false);
	const [followCount, setFollowCount] = useState(0);
	const [followingCount, setFollowingCount] = useState(0);
	const [userForumPosts, setUserForumPosts] = useState([]);

	const handleOpenPopup = () => {
		setIsPopupOpen(true);
	};

	const handleClosePopup = () => {
		setIsPopupOpen(false);
	};

	const handleSubmit = () => {
		setIsPopupOpen(false);
		fetchUserData();
	};

	const fetchUsersListings = async (username) => {
		try {
			const listingsCollection = collection(db, 'listings');
			const data = await getDocs(listingsCollection);
			const listingsData = data.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			const userSpecificListings = listingsData.filter((listing) => listing.username === username);
			setUserListings(userSpecificListings);
		} catch (error) {
			console.log(`Firebase: ${error}`);
		}
	};

	const fetchUserForumPosts = async (userID) => {
		try {
			const forumCollection = collection(db, 'Forum');
			const data = await getDocs(forumCollection);
			const forumData = data.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}))

			const userForum = forumData.filter((post) => post.userID === userID);
			setUserForumPosts(userForum);
		} catch (err) {
			console.log(err);
		}
	};

	const fetchUserReviews = async () => {
		try {
		const reviewsCollection = collection(db, 'Reviews');
		const reviewsQuery = query(reviewsCollection, where('listerID', '==', userID));
		const data = await getDocs(reviewsQuery);
		const reviewsData = data.docs.map((doc) => doc.data());
		setUserReviews(reviewsData);

		const numberOfReviews = reviewsData.length;
		setNumberOfReviews(numberOfReviews);

		if (numberOfReviews > 0) {
			const totalScore = reviewsData.reduce((accumulator, review) => accumulator + review.score, 0);
			const avgScore = totalScore / numberOfReviews;
			setAverageScore(avgScore);
		} else {
			setAverageScore(0);
		}
		} catch (error) {
		console.log(`Firebase: ${error}`);
		}
	};

	const fetchFollowStatus = async () => {
		if (currentUser?.uid) {
		const followDocRef = doc(db, 'Users', userID, 'followers', currentUser.uid);
		const followDocSnap = await getDoc(followDocRef);
		console.log(followDocSnap.exists());
		return followDocSnap.exists();
		}
		return false;
	};
	
	const fetchUserData = async () => {
		try {
		const docRef = doc(db, 'Users', userID);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			const userData = docSnap.data();
			userData.signUpDate = new Date(userData.signUpDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
			setUserInfo(userData);
			fetchUsersListings(userData.username);
			fetchUserForumPosts(userData.id);
			fetchUserReviews();
			const isFollowing = await fetchFollowStatus();
			setFollowUser(isFollowing);
			const followCount = userData.followCount || 0; 
			const followingCount = userData.followingCount || 0; 
			setFollowCount(followCount);
			setFollowingCount(followingCount);
		} else {
			console.log('No user data found');
		}
		} catch (error) {
		console.log(`Firebase: ${error}`);
		}
	};  
	
	useEffect(() => {
		fetchUserData();
	}, [userID]);
	
	const handleLogout = async () => {
		try {
			await auth.signOut();
			console.log('User logged out successfully!');
			navigate('/');
		} catch (error) {
		console.error('Error logging out: ', error.message);
		}
	};

	const handleLoginNavigation = () => {
		navigate('/account');
	};

	const handleUserFollow = async () => {
		if (currentUser?.uid !== userID) {
		const followDocRef = doc(db, 'Users', userID, 'followers', currentUser.uid);
		const followingDocRef = doc(db, 'Users', currentUser.uid, 'following', userID);
		const followDocSnap = await getDoc(followDocRef);
		const followingDocSnap = await getDoc(followingDocRef);
	
		if (followDocSnap.exists()) {
			setFollowUser(true);
			console.log('Already following this user');
		} else {
			try {
			await setDoc(followDocRef, {
				followerID: currentUser.uid,
				timestamp: new Date()
			});
			const userDocRef = doc(db, 'Users', userID);
			await updateDoc(userDocRef, {
				followCount: firebase.firestore.FieldValue.increment(1)
			});
			await setDoc(followingDocRef, {
				followedUserID: userID,
				timestamp: new Date()
			});
			const followerDocRef = doc(db, 'Users', currentUser.uid);
			if (followingDocSnap.exists()) {
				console.log('Already following this user');
			} else {
				await updateDoc(followerDocRef, {
				followingCount: firebase.firestore.FieldValue.increment(1)});
			}
			setFollowUser(true);
			setFollowCount((prevCount) => prevCount + 1);

			await addDoc(collection(db, 'Notifications'), {
				recipientID: userID,
				senderID: currentUser.uid,
				listingID: '',
				type: 'follow',
				read: false,
				timestamp: new Date()
			});
			toast.success(`Successfully Followed`);
			} catch (err) {
			console.error('Error following user: ', err);
			}
		}
		} else {
			console.log('You cannot follow yourself');
		}
	};

	const handleUserUnFollow = async () => {
		if (currentUser?.uid !== userID) {
		const followDocRef = doc(db, 'Users', userID, 'followers', currentUser.uid);
		const followingDocRef = doc(db, 'Users', currentUser.uid, 'following', userID);
	
		try {
			const followDocSnap = await getDoc(followDocRef);
			if (followDocSnap.exists()) {
			await deleteDoc(followDocRef);
			const currentUserDocRef = doc(db, 'Users', currentUser.uid);
			await updateDoc(currentUserDocRef, {
				followingCount: firebase.firestore.FieldValue.increment(-1)
			});
			const userDocRef = doc(db, 'Users', userID);
			await updateDoc(userDocRef, {
				followCount: firebase.firestore.FieldValue.increment(-1)
			});
			await deleteDoc(followingDocRef);
			setFollowUser(false);
			setFollowCount((prevCount) => prevCount - 1);
			console.log('Successfully unfollowed the user');
			} else {
			console.log('You are not following this user');
			}
		} catch (err) {
			console.error('Error unfollowing user: ', err);
		}
		} else {
		console.log('You cannot unfollow yourself');
		}
	};

	return (
		<Format content={
            userInfo ? (
                <>
                    <div className="profile-container">
                        <div className='profile-info-container'>
                            <div className='profile-info'>
                                <div className="profile-pic" style={{ backgroundImage: `url(${userInfo.profilePic || defaultProfilePic})` }} />
                                <p>@{userInfo.username}</p>
                                <p className='join-date'><FaCalendarAlt /> Joined {userInfo.signUpDate}</p>
                                <div className='follow-info'>
                                    <div className='follow-count'>
                                        <h5>{followCount}</h5>
                                        <p>Followers</p>
                                    </div>
                                    <div className='follow-count'>
                                        <h5>{followingCount}</h5>
                                        <p>Following</p>
                                    </div>
                                </div>
                            </div>
                            <div className='profile-buttons'>
                                {currentUser?.uid === userID ? (
                                    <>
                                        <button className="edit-profile" onClick={handleOpenPopup}>
                                            Edit Profile
                                        </button>
                                        {isPopupOpen && <EditPopup onClose={handleClosePopup} onSubmit={handleSubmit} />}
                                        <button className="logout" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    followUser ? (
                                        <button className='unfollow' onClick={handleUserUnFollow}>Unfollow</button>
                                    ) : (
                                        <button className='follow' onClick={handleUserFollow}>Follow</button>
                                    )
                                )}
                            </div>
                        </div>
<div className="profile-toggle">
                            <div
                                className={`toggle ${viewToggle == "listing" ? 'active' : ''}`}
                                onClick={() => setViewToggle('listing')}
                            >
                                Listings
                            </div>
                            <div
                                className={`toggle ${viewToggle == 'review' ? 'active' : ''}`}
                                onClick={() => setViewToggle('review')}
                            >
                                Reviews
                            </div>
							<div
                                className={`toggle ${viewToggle == 'forum' ? 'active' : ''}`}
                                onClick={() => setViewToggle('forum')}
                            >
                                Forum Posts
                            </div>
                        </div>
                    </div>
					<div className="user-content">
					{viewToggle === "listing" ? (
						<div className="users-listings">
							{userListings.length > 0 ? (
								<ProductList heading={`${userInfo.username}'s Listings`} products={userListings} />
							) : (
								<h2>This user has no listings ( ˘･з･)</h2>
							)}
						</div>
					) : viewToggle === "review" ? (
						<div className="user-reviews">
							{userReviews.length > 0 ? (
								<ReviewList
								heading={`${userInfo.username}'s Reviews`}
								reviews={userReviews}
								averageScore={averageScore}
								numberOfReviews={numberOfReviews}
								/>
							) : (
								<h2>This user has no reviews ( ˘･з･)</h2>
							)}
						</div>
						) : (
							<div className="users-forum-posts">
								{userForumPosts.length > 0 ? (
									<ForumList heading={`${userInfo.username}'s Forum Posts`} forums={userForumPosts} />
								) : (
									<h2>This user has no forum posts ( ˘･з･)</h2>
								)}
							</div>
						)}
					</div>
                </>
            ) : (
                <div>
                    <p>No user found.</p>
                    <button onClick={handleLoginNavigation}>Login</button>
                </div>
            )
        } />
	);  
}

export default UserProfile;
