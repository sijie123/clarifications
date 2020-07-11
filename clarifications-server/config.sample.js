module.exports = {
    DB_URI: 'postgres://dbuser:dbpass@dbhost:5432/dbname',
    CMS_DB_URI: 'postgres://cmsdbuser:cmsdbpass@cmsdbhost:5432/cmsdb',
    PORT: 3100,
    plugins: ['AutoDispatcher'],
    adapters: {'ContestantLocation': 'ContestantLocation', 'AuthService': 'AuthService'},
    authAdapters: ['CMSCookieAdapter', 'UserPassAdapter']
}