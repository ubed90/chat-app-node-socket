![ChatsUP Image](https://live.staticflickr.com/65535/53640771865_de40c6bfd6_k.jpg)
# ChatsUP
- [ChatsUP](https://chats-up.onrender.com/) is Fast and Lightweight chat app for the web 🌎. Instantly connect with friends and family using this feature-packed chat application!. 
- This repository serves as Backend of [ChatsUP](https://chats-up.onrender.com/). For running the app locally you need to setup the Frontend as well. [ChatsUP Frontend](https://github.com/ubed90/chat-app-react)


## FrontEnd Setup

### Pre-Requisites
- [NodeJS](https://nodejs.org/dist/v20.12.2/node-v20.12.2.pkg) Version >= 18 Installed

- [MongoDB](https://www.mongodb.com/products/self-managed/community-edition)

- Frontend setup locally - [Link](https://github.com/ubed90/chat-app-react)

- Email client account Setup - [Brevo](https://app.brevo.com/)

- Cloudinary account Setup - [Cloudinary](https://cloudinary.com/)

### SETUP
- Clone the Repository 
```bash
git clone https://github.com/ubed90/chat-app-node-socket.git
```
- Open your terminal in root of the repository and install the dependencies
```bash
npm install
or
yarn
```

- Rename the [.env.example](https://github.com/ubed90/chat-app-react/blob/main/.env.example) at the root of the project to ```.env```.

- Add the required environment variables which we got from the prerequisites to ```.env```

- Run the project
```bash
npm run dev
or
yarn dev
```

## Steps to Contribute
- Fork the repository
- Create a new branch
- Make your changes <br /> - Make your code changes and ensure they adhere to the project's coding style and conventions.
- Push your branch
- Create a pull request with meaningful description.

## Feature Requests for Contribution
- Move Notifications to backend so that they persist on refresh
- Reply a Message feature
- Group messages Sent, Read and Delivered feature