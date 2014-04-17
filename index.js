'use strict';
var util = require('util');
var q = require('./TelQ');
var path = require('path');
var _ = require('lodash');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var NodeRestClient = require('node-rest-client').Client;

var TeluiGenerator = yeoman.generators.Base.extend({
    init: function () {
        this.pkg = require('../package.json');

        this.on('end', function () {
            if (!this.options['skip-install']) {
                this.installDependencies();
            }
        });
    },

    askFor: function () {
        var done = this.async();

        // have Yeoman greet the user
        this.log(this.yeoman);

        // replace it with a short and sweet description of your generator
        this.log(chalk.magenta('You\'re using the fantastic Telui generator.'));

        var $self = this;

        this._getTelUIRepoNames().then(function(repoNames) {
            var prompts = [{
                type: 'checkbox',
                name: 'telUIComponents',
                message: 'Which TelUI sub-components will you be using for this TelUI component?',
                choices: repoNames,
                default: true
            }];

            $self.prompt(prompts, function (props) {
                $self.someOption = props.someOption;

                done();
            }.bind($self));
        });
    },

    app: function () {
        this.mkdir('app');
        this.mkdir('app/templates');

        this.copy('_package.json', 'package.json');
        this.copy('_bower.json', 'bower.json');
    },

    projectfiles: function () {
        this.copy('editorconfig', '.editorconfig');
        this.copy('jshintrc', '.jshintrc');
    },

    // Supplying a large per_page here so we don't have to deal with pagination
    // in our logic
    __baseUrl: 'https://api.github.com/orgs/<%=organizationName%>/repos?per_page=1000',
    __organizationName: 'Telogical',

    _getTelUIRepoNames: function _getTelUIRepoNames() {
        var deferred = q.defer();

        var auth = {
            user: this._getGithubApiKey(),
            password: 'x-oauth-basic'
        };

        var client = new NodeRestClient(auth);

        var args = {
            headers: {
                'User-Agent': 'curl/7.9.8 (i686-pc-linux-gnu) libcurl 7.9.8 (OpenSSL 0.9.6b) (ipv6 enabled)'
            }
        };

        var telUIRepos = [];

        var url = this._buildGithubUrl();
        client.registerMethod('jsonMethod', url, 'GET'); 
        client.methods.jsonMethod(args, function(repos){
            repos = JSON.parse(repos);
            _.forEach(repos, function(repo) {
                if(repo.name.indexOf('TelUI-') === 0) {
                    telUIRepos.push(repo.name); 
                }
            });
            deferred.resolve(telUIRepos);
        });

        return deferred.promise;
    },

    _getHomeDirPath: function _getHomeDir() {
        return  (process.platform === 'win32') ?
            process.env.HOMEPATH :
            process.env.HOME;
    },

    _getConfigName: function _getConfigName() {
        return  (process.platform === 'win32') ?
            '_githubconfig' :
            '.githubconfig';
    },

    _buildGithubUrl: function _buildGithubUrl() {
        return _.template(this.__baseUrl, { 
            'organizationName': this.__organizationName
        });
    },

    _getGithubApiKey: function _getGithubApiKey() {
        var home = this._getHomeDirPath();
        var githubConfigName = this._getConfigName();

        var githubConfigPath = path.join(home, githubConfigName);
        var githubConfig = JSON.parse(this.readFileAsString(githubConfigPath));

        return githubConfig.personalAccessToken;
    }
 
});

module.exports = TeluiGenerator;
