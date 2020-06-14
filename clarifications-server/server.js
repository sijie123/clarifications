const config = require('./config.js');
const express = require('express');
const app = express();

const common = require('./util/common.js');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

// const authRouter = require('./routers/authRouter.js');
// const updateRouter = require('./routers/updateRouter.js');
// const threadRouter = require('./routers/threadRouter.js');
// const groupRouter = require('./routers/groupRouter.js');
// const userRouter = require('./routers/userRouter.js');

app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({limit: '50mb'}));
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

const fs = require('fs');
let files = fs.readdirSync('./routers');
for (let routerFile of files) {
    if (routerFile.endsWith('Router.js')) {
        let path = routerFile.slice(0, -9);
        const router = require(`./routers/${routerFile}`);
        app.use(`/${path}`, router);
        console.log(`Loaded route: /${path} will be handled by ${routerFile}`)
    }
}
// app.use('/auth', authRouter)
// app.use('/update', updateRouter)
// app.use('/thread', threadRouter)
// app.use('/group', groupRouter)
// app.use('/user', userRouter)
app.listen(config.PORT, () => console.log(`Clarification Server listening on port ${config.PORT}!`));
