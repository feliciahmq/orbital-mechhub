import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import LandingPage from "./pages/landing/LandingPage";
import { AuthProvider } from './Auth';
import { LikeCountProvider } from "./components/header/likecounter/LikeCounter";
import LoginSignupForm from "./pages/registration/LoginSignupForm";
import UserProfile from "./pages/userprofile/UserProfile";
import SearchPage from "./pages/search/SearchPage";
import ListingPage from "./pages/listing/Listing";
import Chat from "./pages/chatapp/ChatApp";
import ReviewPage from "./pages/review/Review";
import NotificationsPage from "./pages/notificaiton/Notificaitons";
import ProductPage from "./pages/viewproduct/ViewProduct";
import LikesPage from "./pages/likes/Likes";
import ForumPage from "./pages/forum/Forum";
import NewForumPost from "./pages/forum/newForumPost/NewForumPost";
import ForumPostPage from "./pages/forumpost/ForumPost"
import KeyboardGuidePage from "./pages/keyboardguide/KeyboardGuide";

const App = () => {
return (
	
	<AuthProvider>
	<LikeCountProvider>
	<Toaster />
	<Router>
		<Routes>
			<Route path="/" element={<LandingPage />} />
			<Route path="/account" element={<LoginSignupForm />} />
			<Route path="/profile" element={<UserProfile />} />
			<Route path="/profile/:userID" element={<UserProfile />} />
			<Route path="/search" element={<SearchPage />} />
			<Route path="/listing" element={<ListingPage />} />
			<Route path="/listing/:listingID" element={<ListingPage />} />
			<Route path="/product/:listingID" element={<ProductPage />} />
			<Route path="/likes/:userID" element={<LikesPage />} />
			<Route path="/review/:userID" element={<ReviewPage />} />
			<Route path="/notifications/:userID" element={<NotificationsPage />} />
			<Route path="/chat" element={<Chat />} />
			<Route path="/chat/:userID" element={<Chat />} />
			<Route path="/chat/:userID/:chatID" element={<Chat />} />
			<Route path="/forum" element={<ForumPage />} />
			<Route path="/newforumpost" element={<NewForumPost />} />
			<Route path="/newforumpost/:postID" element={<NewForumPost />} />
			<Route path="/forumpost/:postID" element={<ForumPostPage />} />
			<Route path="/keyboardguide" element={<KeyboardGuidePage />} />
		</Routes>
	</Router>
	</LikeCountProvider>
	</AuthProvider>
);
}

export default App;