const config = require('./config.js');
const express = require('express');
const app = express();

const {AuthService} = require('./util/common.js');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

const authRouter = require('./routers/authRouter.js');
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
        else if (msg instanceof Error) {
            if (msg.errorCode) return res.status(msg.errorCode).json({status: 'fail', msg: `${msg}`});
            else return res.status(500).json({status: 'fail', msg: `${msg}`})
        } else {
            //Assume JSON
            return res.status(errorCode).json(Object.assign({status: 'fail'}, msg));
        }
    }
    next();
})

app.use(AuthService.verify().unless({path: ['/api/auth', '/api/login', '/api/login/', '/api/update/loadtest', '/api/uploads/c2905ae04c1955952253fb1b27bc2e949870fdf4.jpg']}))

const path = require('path');
const IMAGE_DIR = path.join(__dirname, 'uploads');
app.use('/api/uploads', express.static(IMAGE_DIR));

const fs = require('fs');
let files = fs.readdirSync('./routers');
for (let routerFile of files) {
    if (routerFile.endsWith('Router.js')) {
        let path = routerFile.slice(0, -9);
        const router = require(`./routers/${routerFile}`);
        app.use(`/api/${path}`, router);
        console.log(`Loaded route: /api/${path} will be handled by ${routerFile}`)
    }
}
app.use('/api/login', authRouter)
// app.use('/auth', authRouter)
// app.use('/update', updateRouter)
// app.use('/thread', threadRouter)
// app.use('/group', groupRouter)
// app.use('/user', userRouter)
app.listen(config.PORT, () => console.log(`Clarification Server listening on port ${config.PORT}!`));
