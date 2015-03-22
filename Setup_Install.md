Install & Setup  Guide
=============


### Quick-start guide
1.  [Fork](https://github.com/gdg-x/zeppelin-grunt/fork) this repo
2.  Clone locally
3.  Install [Node.js](www.nodejs.org) and [Ruby](https://www.ruby-lang.org/)
4.  Run `gem install bundler`
5.  Install 'grunt-cli' and 'bower' globally with `npm install -g grunt-cli bower`
6.  `$cd` to the directory and run `bundle install`
7.  Run `npm install` to install the necessary "npm" dependencies
8.  Then run `bower install` to install the front-end dependencies
9.  Edit site variables


In `Gruntfile.js` edit **baseurl** and **git_repo** (destination repository):
```
grunt.initConfig({
        app: {
            source: 'app',
            dist: 'dist',
            baseurl: 'zeppelin-grunt',  // Here
            git_repo: 'git@github.com:gdg-x/zeppelin-grunt.git'  // And here
        },
    ...
```

In `_config.yml` you should also update **baseurl** and **url**:
```
# Site settings
baseurl: "/zeppelin-grunt"  // Here
url: "http://gdg-x.github.io"  // And here
permalink: '/blog/:title'
...
```

**Now you are ready for development**. Following commands are available:

1.  `grunt` (by default it runs `grunt serve`) - build and start your site for **development** (with livereload, js uglifing and sass compilation) 
2.  `grunt serve:dist` - build and start your site with **production** configs (this is how it will look online)
3.  `grunt deploy` - build and deploy your site into a repository you defined in previous steps




### Used libraries
* [Bootstrap Sass](https://github.com/twbs/bootstrap-sass)
* [Animate.css Sass](https://github.com/tgdev/animate-sass)
* [Waves](https://github.com/publicis-indonesia/Waves)
* [jquery.appear](https://github.com/bas2k/jquery.appear)
* [jQuery countTo Plugin](https://github.com/mhuggins/jquery-countTo)
* [Typed.js](https://github.com/mattboldt/typed.js)
* [Sticky-kit](https://github.com/leafo/sticky-kit)
