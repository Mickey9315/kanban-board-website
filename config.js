module.exports = {
    development: {
        db: 'mongodb://localhost:27017/kanbanDB',
        secret: 'bestkanbanboardever',
        port: process.env.PORT || 8080
    },
    production: {
      db: 'mongodb://juangm91:jjgmongo@ds019478.mlab.com:19478/taskban',
      secret: 'bestkanbanboardever',
      port: process.env.PORT || 80
    }
}
