const config = require('./config.js');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

const authRouter = require('./routers/authRouter.js');
const updateRouter = require('./routers/updateRouter.js');
const threadRouter = require('./routers/threadRouter.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser())
app.use((req, res, next) => {
    res.success = (json) => {
        return res.status(200).json(Object.assign({status: 'OK'}, json));
    };
    res.failure = (msg, errorCode = 500) => {
        if (typeof msg === 'string')
            return res.status(errorCode).json({status: 'fail', msg: msg});
        else if (msg instanceof Error)
            return res.status(msg.errorCode).json({status: 'fail', msg: `${msg}`});
        else //Assume JSON
            return res.status(errorCode).json(Object.assign({status: 'fail'}, msg));
    }
    next();
})

app.use('/auth', authRouter)
app.use('/update', updateRouter)
app.use('/thread', threadRouter)
app.listen(config.PORT, () => console.log(`Clarification Server listening on port ${config.PORT}!`));
