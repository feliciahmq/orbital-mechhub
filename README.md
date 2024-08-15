# NUS Orbital Project 2024 - MechHub
Created By **Felicia Hwang** & **Vanessa Lai**

![Landing Page](/public/Project.png)

Check out our website here : https://orbital-mechhub.web.app/

## Project Overview
![poster](/public/6182.png)


# Table of Contents

- [Preview](#preview)
- [Introduction](#introduction)
  - [Team](#team)
  - [About](#about)
- [Features](#features)

  - [Authentication](#authentication)
  - [Product Listing](#product-listing)
  - [Reviews of Products & Sellers](#reviews-of-products--sellers)
  - [Chat System](#chat-system)
  - [Search Page](#search-page)
  - [Following](#following)
  - [Recommendation Engine](#recommendation-engine)
  - [Forum](#forum)
  - [Seller Sales Dashboard](#seller-sales-dashboard)

- [Tech Stack](#tech-stack)

- [Concept Diagrams](#concept-diagrams)

  - [Entity-Relation Diagram](#entity-relation-diagram)
  - [MVC Diagram](#mvc-diagram)

- [Software Engineering Practices](#software-engineering-practices)

  - [Testing](#testing)
    - [User Testing](#user-testing)
    - [Unit Testing](#unit-testing)
  - [Continuous Integration / Continuous Development (CI/CD)](#continuous-integration--continuous-development-cicd)

- [Software Design Principles](#software-design-principles)
  - [Don't Repeat Yourself (DRY)](#dont-repeat-yourself-dry)
  - [Single Responsibility Principle (SRP)](#single-responsibility-principle-srp)
- [Project Management Practices](#project-management-practices)
  - [Version Control with Git](#version-control-with-git)
  - [Scrum Methodology](#scrum-methodology)
  - [GitHub Milestones & Issues](#github-milestones--issues)
- [Timeline](#timeline)
- [Conclusion](#conclusion)

# Preview

Explore our project further!

**Website**: Visit our [site](https://orbital-mechhub.web.app/)

**Project Poster**: View our [poster](https://drive.google.com/file/d/1uU4u9Sy5Ce1A-NAarbhvKuDFL8-iuiZV/view?usp=sharing)

**Project Video**: Watch the [demo](https://drive.google.com/file/d/1i8LdTik2sQtGYfhm3wfv7jl4BkbwjrxU/view?usp=sharing)

# Introduction

## Team

**Team Number**: 6182 \
**Level of Achievement**: Apollo 11 (Advanced)

## About

### Motivation

As avid enthusiasts of mechanical keyboards, we face challenges and frustrations trying to find a safe and reliable platform to buy and sell our keyboards. The current platforms for buying and selling mechanical keyboards are fragmented, and they heavily rely on platforms like Discord and Reddit to connect with other buyers or sellers. These platforms need the structure and security that an e-commerce platform can offer. E-commerce functionalities like an organised listing system and buyer protection elevate a user’s buying and selling experience.

### Aim

Recognising the absence of a dedicated marketplace for mechanical keyboards, we aim to create a unique e-commerce site for passionate yet niche mechanical keyboard enthusiasts. We want to provide a platform where users can explore a curated selection of keyboards, connect with fellow enthusiasts. By centralising the marketplace for mechanical keyboards, the platform provides exposure to second-hand items and small businesses, catering to the diverse needs of the mechanical keyboard community. It aims to foster a sense of community, facilitating knowledge sharing, and growth within the hobby.

### User Stories

As a user, I want to be able to create an account and log into my account so that I can have a personalised shopping experience and make purchases securely.

As a user, I want to be able to reset my password if I forget so that I can regain access to my account.

As a buyer, I want to view all product listings by other users so that I can browse and make the best purchase.

As a seller, I want to list my old or new products so that I can let other users purchase them.

As a buyer, I want to like products so that I can find them again.

As a buyer, I want to leave reviews for purchased products so that I can share my experience with other users.

As a buyer, I want to read reviews by other buyers so that I can make an informed decision.

As a buyer, I want to send messages to sellers so that I can ask questions about their products.

As a seller, I send messages and images to potential buyers so that I can provide more information and persuade them to buy.

As a user, I want to be able to block other users so that I do not receive an harmful messages.

As a buyer, I want to search for products and filter by product type, price range and sort them by price so that I can easily browse products.

As a buyer, I want to follow other sellers so that I can be notified of their new products.

As a user, I want to participate in a keyboard community forum, so that I can share and learn about keyboards with other enthusiasts.

As a user, I want to create threads in the forum so that I can start discussions about topics that interest me.

As a buyer, I want to receive personalised product recommendations based on my likes and purchase history so that I can discover new products that I may like.

# Features

## Authentication

The authentication features include registering, logging in, and signing out of user accounts linked to a Firebase backend database. A new user can register for an account with their user details: Username, Email and Password. The Firebase will keep a record of the unique UserID, username and email.

![alt text](/public/image.png)

Toast error notifications will be shown when users violate these rules in the Sign Up form:

1. All fields must be filled.
2. Users must enter a password of at least 6 characters.
3. Users enter an email that is already registered.
4. The passwords the user enters do not match.

Users can then log in to their account using their email and password. Additionally, the addition of the Google OAuth API allows users to use their Google accounts to register and log in.

![alt text](/public/image-1.png)

Toast error notifications will be shown when users violate these rules in the Log In form:

1. All fields must be filled.
2. Users enter an email that still needs to be registered.
3. Users enter the wrong password.

Once logged in, users can edit their profile picture, username, and email on the Profile Page.

![alt text](/public/image-2.png)

**User Case Diagram for User Authentication**

![user-auth](/public/user-auth-diagram.png)

## Product Listing

The product listing feature allows users to CRUD and is linked to Firebase. Users can create new listings by clicking the new listing button in the header.

![alt text](/public/image-4.png)

Users are required to fill in five fields: product image, title, product type, and description, which provides information on the listing to other users and allows us to filter the products on the search page further on.

![alt text](/public/image-5.png)

Users will also be allowed to update and delete listings they have posted in the past, they will access these options when they view the listing.

![alt text](/public/image-6.png)

The lister's user ID will also be updated in the listing so that the users can display their listings on their profile pages. When a user creates a new listing, a notification is sent to all their followers, informing them of it.

They will also be able to accept and receive offers from interested users for their listings. Users can mark their listings as sold, removing them from the search page but still making them visible on their profile pages.

![alt text](/public/image-7.png)

**User Case Diagram for Product Listing**

![listing](/public/listing-diagram.png)

## Reviews of Products & Sellers

Users can leave reviews on buyers/ sellers they have interacted with before, and the average scores of all their reviews will be reflected on their user profiles. Users can also view their own and others' reviews through the user profile page.

Users can only leave reviews for one another after an interested party makes an offer and the lister accepts the offer. This is to ensure that reviews on the site are genuine.

This will thus enable users to make a more informed choice when dealing with different users, increasing the transparency of our site, and providing an incentive for good behaviour on the site, as users who receive better reviews are more likely to be interacted with.

![review](/public/review-diagram.png)

## Chat System

Buyers can use Chat System to communicate with sellers to further inquire about their listings.

![alt text](/public/image-8.png)

**User Case Diagram for Chat System**

![chat](/public/chat-system-diagram.png)

Every user has a chat page. Users can search for other users by their username and start a chat. All chat history will be logged. The chat system allows users to send texts and images. Key features include :

1. User Search – Allows users to find users by username and start a chat.
2. Chat Search – To filter by username and find a specific chat with someone.
3. Shared Photos – Stores images sent in each chat under Shared Photos
4. Block/ Unblock User – When blocked, users cannot send messages or view each other’s usernames and profile pictures.
5. Message Timestamps – Each message shows a relative time, e.g. 5 mins ago.
6. Future extension: Group Chat Function

## Search Page

The search page allows users to search for and filter listings. It uses the search bar in the header to allow users to search for listings and compares the search query against various attributes of each listing (name, product type, description, and lister's username). Then, it returns a filtered list of listings that match the query.

For each product in the database, the title, productType, description, and the lister's username are converted into lowercase and checked to see if the search query is a substring of any of these fields.

![alt text](/public/image-9.png)

The user can filter the products by price and product type in the filter and sort the listings. The options to sort are as follows:

1. **Price**: high-to-low and low-to-high
2. **Best Match**: \
   By calculating the relevance of a listing based on how well it matches the search query, it assigns a relevance score to each product by checking if the search query is present in the listing name, description and product type
3. **Featured**: \
   The number of clicks and offers made for a listing is tracked, and the listings with the highest click rates, likes and offers are at the top, while those with lower click rates and offers are at the bottom.

## Following

The user-following feature on MechHub enables users to engage with the community by allowing them to follow other users whose posts they find interesting. When a user decides to follow another user, the system creates reciprocal relationships in the database, ensuring both users are aware of the connection. Followers will be automatically notified within their account whenever the user they are following posts a new listing or forum post. This notification system ensures that followers stay up-to-date with the latest posts, promoting active engagement and facilitating the discovery of desirable listings.

![alt text](/public/image-10.png)

Using Firebase Firestore, we can provide real-time updates for the following notifications, and users get instant feedback when they follow someone or when new notifications are available.\
Users are also able to view the number of followers and following they have through their profile page. A future extension of this feature would be to send out emails notifying the users that the notification is received through EmailJS.

## Recommendation Engine

Users will receive product recommendations based on their interactions, such as liking and clicking products. This feature aims to provide a more personalised experience by suggesting items that align with their preferences. The recommendations are calculated using Cosine Similarity, which measures the similarity between products. The TensorFlow library converts textual data into vectors, and the similarity is calculated using cosine similarity.

1. **Similar Products**:
   Similar Products fetches and displays listings similar to the current product based on the title, description, and price.
   Combines the title similarity (40%), description similarity (40%), and price similarity (20%) to generate a final similarity score. The products are then sorted based on this score, and the top results are displayed.

2. **For You**:
   For You provides personalised recommendations based on the user's historical interactions, liking, searching and reviewing products.
   Sorts the products based on their similarity to the user's preferences and returns the most similar products as recommendations.

## Forum

The forum aims to be a place where fellow keyboard enthusiasts can exchange information, ask questions, and interact with one another.

We are also able to create poll questions in the poll. There is also a sort and search function in the poll page using the same components and sorting algorithm as the listing search page to facilitate easy filtering of forum posts.In post creation, users can add a title, content, tags, media (images or videos), and optionally include a poll. Users can like, comment on, and share posts. The like and comment counts are displayed on each post.

![alt text](/public/image-11.png)

Users are also allowed to comment and like forum posts. Comments are stored in a nested structure, allowing a hierarchical display of comments and replies and supporting multiple levels of comments.

![alt text](/public/image-12.png)

Like the search page, users can sort and filter forum posts to find content that interests them.

## Seller Sales Dashboard

The sales dashboard provides sellers with detailed analytics about their listed items. The analytics include price trends, click counts, time on market, and the number of offers. The component utilises Firebase for data retrieval and Chart.js for data visualisation.

1. **Price**\
   The listing price is compared to the average, median, upper, and lower quartiles of the same product type. It is displayed as a box-and-whisker diagram for easy comparison.
   ![alt text](/public/image-13.png)

2. **Click Count**\
   Click count is compared weekly to the number of clicks received by other products of the same type in a particular week.
   ![alt text](/public/image-14.png)

3. **Time On Market**
   Time on market is displayed as a scatter graph, showing the time other available listings of the same product type have been on the market and the time it takes for sold listings. It maps them against price.
   ![alt text](/public/image-15.png)

4. **Number of Offers** \
   It will be represented as a line chart and show the seller the price users have offered for their listings compared to the listing price of the product.
   ![alt text](/public/image-16.png)

We have also included the Similar Products recommendation to allow them to view products similar to theirs. The dashboard aims to give sellers a more accurate sense of market prices.

# Tech Stack

**Languages** \
HTML\
CSS\
JavaScript

**Frameworks/Libraries** \
React JS\
Bootstrap\
Zustand (State Management)\
GraphJS

**Tools/Services** \
Firebase Database\
Firebase Hosting\
Git\
GitHub

# Concept Diagrams

## Entity-Relation Diagram

![erd](/public/erd.png)

## MVC Diagram

![alt text](/public/image-17.png)

# Software Engineering Practices

## Testing

### User Testing

**User Testing Log**: [User Testing](https://docs.google.com/document/d/1BoK2vFhpaghowNyU_FHcMcL1kW8mduE1suceHmoHmsk/edit#heading=h.anjijdvc0vw8)

We gathered a group of 10 users to let them try out our website and received feedback mainly on the aesthetics and functionality of the site. For the user testing of milestone 3, we used the same test group as in milestone 2.

### Unit Testing

**Unit Testing Log**: [Unit Testing](https://docs.google.com/document/d/15Rhglv_PdVF8M5SzK7M6BeqiaPXVg082ARKcUf8UlUg/edit?usp=sharing)

For unit testing, we mainly tested the functionality of the pages and their components. We utilised React Testing Library and Jest for testing, allowing us to test the components in a way that resembles how the end user would use them by mocking the user. The unit tests allowed us to test components in isolation, ensuring they all worked correctly.

## Continuous Integration / Continuous Development (CI/CD)

Automatic Firebase deployment and GitHub Actions are set up. Two GitHub workflows are built:

1. Deploy to Firebase Hosting on every Pull Request created
   A pull request triggers deployment to Firebase Hosting whenever a pull request is created, ensuring changes to in a pull request are deployed to a staging environment for testing and review

2. Deploy to Firebase Hosting on every Merge to main branch
   A merge to the main branch triggers deployment to Firebase Hosting whenever a pull request is created, ensuring that the main branch always reflects the latest stable version of your application

Together, these allow us to ensure that every change is tested and deployed without manual intervention, leading to a continuous deployment pipeline.

# Software Design Principles

## Don't Repeat Yourself (DRY)

We created reusable components to make our project's development easier to read and cleaner.
This also helped us easily adapt to the changes, as we only needed to update the code in one location.

## Single Responsibility Principle (SRP)

Each component in MechHub follows SRP. For example, the Listing Component is only responsible for managing the listing information and the creation or updating of such information is only handled by that component. This allows our code base to be modular, making it easier for future maintenance and updates.

# Project Management Practices

## Version Control with Git

We utilised Git for version control which significantly enhanced our development process. For each feature, we made a separate branch so that we could work on it independently without affecting the main codebase. This approach ensured a seamless and well-organised process. The features are then integrated into the main branch after they were completed and thoroughly tested.

We implemented pull requests, coupled with mandatory code reviews to ensure code quality. Before any code could be merged into the main branch, it had to be reviewed by the other party. This process is crucial to catch potential bugs early and ensure that only high-quality code is pushed into our main codebase. Feature branching and code reviews gave us the flexibility to revert back to previous versions when necessary, adding the extra layer of security in our development.

## Scrum Methodology

We adopted a scrum approach to our project management. The process began with project ideation, where we defined the project’s vision and goals. This was followed by sprint planning, where we broke down the work into manageable tasks and prioritized them in our backlog. Throughout the project, we held weekly sprint meetings to keep each other updated on our progress and addressed any modifications or difficulties we ran into during each sprint.

This allows us to maintain a consistent pace of development and facilitate regular communication within the team. With this approach, we are able to ensure that everyone remained aligned with the project’s status and goals, and flexible and adaptable in response to new challenges and opportunities.

## GitHub Milestones & Issues

### Milestones

We made use of milestones to organise our project schedule and made sure we met important deadlines. Three monthly milestones were created, each representing different phases of our project. With this approach, we were able to break down our project timeline into manageable parts, making it easier to track progress and ensure we are meeting our goals at each stage of development.

### Issue Tracking

We used GitHub Issues for task management and backlog organisation. We created our own labeling and categorised issues based on their type and priority. With this system, we were able to identify urgent issues and bugs, allowing us to focus on more critical aspects on the project at any given time.

# Timeline
**Milestone 1**
- Set up of development environments
- Come up with basic UI elements, including page (brand) colours and logo
- Create and connect database
- Authentication
- Landing page
- Product Listing Page

**Milestone 2**
- Add CRUD features for Product Listings
- Review System
- Search Page
- Chat System
- Likes & Following
- User Testing
- Unit Tesing

**Milestone 3**
- Forum
- Recommendation System
- Seller Sales Dashboard
- Unit Testing
- Squashed Bugs
- Worked on user testing feedbacks

# Conclusion
This project is a culmination of our hard work and learning. It has allowed us to dive deep into engineering practices and hone our skills in coding standards, version control, and testing. We have grown as developers, overcoming challenges and turning them into learning opportunities.

We would like to thank everyone who has contributed to our project, offered support and guidance, and helped out with user testing.

Feel free to explore our project further:
- **Website**: Visit our [site](https://orbital-mechhub.web.app/)
- **Project Poster**: View our [poster](https://drive.google.com/file/d/1uU4u9Sy5Ce1A-NAarbhvKuDFL8-iuiZV/view?usp=sharing)
- **Project Demo Video**: Watch our [demo video](https://drive.google.com/file/d/1i8LdTik2sQtGYfhm3wfv7jl4BkbwjrxU/view?usp=sharing)
- **Project Log**: View our [Project Log](https://docs.google.com/spreadsheets/d/1U6BihLqkvpjTwPoX4rgfyp6Z4rTzJAucRT9hYzpYO1w/edit?gid=0#gid=0)

Thank you for your interest in our project!

Happy coding,\
Felicia Hwang and Vanessa Lai \
Orbital 2024

