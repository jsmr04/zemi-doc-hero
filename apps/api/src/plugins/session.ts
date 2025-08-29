import session from "express-session";

//INFO: You can move this constant to .env if needed
const EXPIRE_IN = 1000 * 60 * 60 * 24; // 24 Hours

export default session({
    //INFO: Generate your own secret key a move it to .env
    // you cn use this site to generate your key https://randomkeygen.com/
    secret: "GENERATE_YOUR_OWN_SECRET_KEY",
    saveUninitialized: true,
    //INFO: Change the secure flag to 'true' once the project is running 
    //in prouction and has the SSL
    cookie: { maxAge: EXPIRE_IN, secure: false }, 
    resave: true,
})