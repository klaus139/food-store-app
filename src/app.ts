import express, { Request, Response } from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
//import indexRouter from './routes/index';
import userRouter from './routes/users';
import indexRouter from './routes/index';
import {db} from './config/index';
const app = express();
import dotenv from 'dotenv';
dotenv.config();

//sequelize connection
db.sync().then(()=> {
    console.log("Connection to database established");
}).catch(err => {
    console.log(err);
});

const PORT = 5002;
app.use(express.json());
app.use(logger('dev'));
app.use(cookieParser());
//app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/', indexRouter);

//kill all node ------ to stop all servers

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})

export default app;