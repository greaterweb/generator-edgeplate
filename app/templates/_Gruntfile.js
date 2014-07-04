'use strict';

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var path = require('path');
    var sprintf = require('sprintf');

    grunt.initConfig({

        project: {
            dir : 'public',
            pkg : grunt.file.readJSON('bower.json'),
            port: 3000,
            hostname: 'localhost',
            baseUrl: '/',
            src: path.resolve('app'),
            app: '<%= project.src %>/<%= project.dir %>',
            dist: path.resolve('dist/'),
            temp: path.resolve('.tmp/'),
            test: path.resolve('test/'),
            server: '<%= project.src %>/app.js',
            buildTarget: 'dev',
            cordova: path.resolve('cordova/www/'),
            today: new Date(),
            version: '0.0'
        },

        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: '/*\n' +
                    '* Copyright FIXME and others. See credits page.\n' +
                    '* Revision: <%= project.revision %>\n' +
                    '* Build: <%= project.today.toString() %>\n' +
                    '*/',
                    linebreak: true
                },
                files: {
                    src: [
                        '<%= project.dist %>/**/*.css',
                        '<%= project.dist %>/public/scripts/*.js'
                    ]
                }
            }
        },

        revision: {
            options: {
                property: 'project.revision',
                ref: 'HEAD',
                short: true
            }
        },

        jsonlint: {
            dist: {
                src: ['<%= project.app %>/locales/**/*.json']
            }
        },

        uglify: {
            /*jshint camelcase: false */
            options: {
                compress: {
                    dead_code: true
                }
            },
            www: {
                options: {
                    compress: {
                        drop_debugger: true
                    }
                }
            },
            cordova: {
                options: {
                    compress: {
                        drop_debugger: true
                    }
                }
            }
        },
        watch: {
            sass: {
                files: [
                    '<%= project.app %>/**/*.{scss,sass}'
                ],
                tasks: ['sass:server']
            },
            jsonlint: {
                files: [
                    '<%= project.app %>/locales/**/*.json'
                ],
                tasks: ['jsonlint:dist']
            },
            jade: {
                files: [
                    '<%= project.app %>/**/*.jade'
                ],
                tasks: ['config.sh', 'jade:server']
            },
            livereload: {
                files: [
                    '<%= project.app %>/**/*.html',
                    '<%= project.temp %>/**/*.html',
                    '<%= project.app %>/styles/**/*.css',
                    '<%= project.temp %>/styles/**/*.css',
                    '<%= project.app %>/images/**/*.{gif,png,jpg,jpeg}',
                    '<%= project.app %>/styles/images/**/*.{gif,png,jpg,jpeg}',
                    '<%= project.app %>/components/**/*.js',
                    '<%= project.app %>/controllers/**/*.js',
                    '<%= project.app %>/directives/**/*.js',
                    '<%= project.app %>/scripts/**/*.js'
                ],
                tasks: ['livereload']
            },
            server: {
                files: [
                    '<%= project.server %>'
                ],
                tasks: ['express:restart', 'livereload']
            }
        },

        open: {
            server: {
                url: 'http://<%= project.hostname %>:<%= project.port %>'
            }
        },

        clean: {
            dist: {
                src: [
                    '<%= project.temp %>/*',
                    '<%= project.dist %>/*'
                ]
            },
            server: {
                src: [
                    '<%= project.temp %>/*'
                ]
            },
            cordova: {
                src: [
                    '<%= project.cordova %>/*',
                    '!<%= project.cordova %>/config.xml'
                ]
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            grunt: 'Gruntfile.js',
            express: [
                '<%= project.server %>/**/*.js'
            ],
            app: [
                '<%= project.app %>/components/**/*.js',
                '<%= project.app %>/controllers/**/*.js',
                '<%= project.app %>/directives/**/*.js',
                '<%= project.app %>/scripts/**/*.js',
                '!<%= project.app %>/scripts/services/lbServices.js'
            ]
        },

        useminPrepare: {
            options: {
                baseUrl: '<%= project.app %>',
                dest: '<%= project.dist %>/<%= project.dir %>',
                uglify: 'uglify.<%= project.buildTarget %>.files'
            },
            html: ['<%= project.app %>/*.html','<%= project.temp %>/**/*.html']
        },

        usemin: {
            options: {
                dirs: ['<%= project.dist %>/<%= project.dir %>']
            },
            html: ['<%= project.dist %>/<%= project.dir %>/**/*.html'],
            css: ['<%= project.dist %>/<%= project.dir %>/styles/*.css']
        },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= project.app %>/images',
                    src: '**/*.{png,jpg,jpeg}',
                    dest: '<%= project.dist %>/<%= project.dir %>/images'
                }, {
                    expand: true,
                    cwd: '<%= project.app %>/styles/images',
                    src: '**/*.{png,jpg,jpeg}',
                    dest: '<%= project.dist %>/<%= project.dir %>/styles/images'
                }]
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= project.src %>',
                    dest: '<%= project.dist %>',
                    src: [
                        '<%= project.dir %>/*.html',
                        '<%= project.dir %>/partials/**/*',
                        '<%= project.dir %>/styles/**/*.gif',
                        '<%= project.dir %>/styles/fonts/**/*',
                        '<%= project.dir %>/favicon.ico',
                        'views/**/*',
                        'services/**/*',
                        'package.json',
                        'app.js'
                    ]
                },{
                    expand: true,
                    dest: '<%= project.dist %>',
                    src: [
                        'package.json'
                    ]
                }]
            },
            cordova: {
                files: [{
                    expand: true,
                    cwd: '<%= project.dist %>/<%= project.dir %>',
                    dest: '<%= project.cordova %>',
                    src: [
                        '**/*'
                    ]
                }]
            },
            postJade: {
                files: [{
                    expand: true,
                    cwd: '<%= project.temp %>',
                    dest: '<%= project.dist %>',
                    src: ['**/*.html']
                }]
            }
        },

        sass: {
            options: {
                precision: 10
            },
            server: {
                options: {
                    debugInfo: true,
                    lineNumbers: true,
                    style: 'expanded'
                },
                files: {
                    '<%= project.temp %>/styles/app.css': '<%= project.app %>/styles/app.scss'
                }
            },
            dev: {
                options: {
                    style: 'expanded'
                },
                files: {
                    '<%= project.dist %>/<%= project.dir %>/styles/app.css': '<%= project.app %>/styles/app.scss'
                }
            },
            www: {
                options: {
                    style: 'compressed'
                },
                files: {
                    '<%= project.dist %>/<%= project.dir %>/styles/app.css': '<%= project.app %>/styles/app.scss'
                }
            },
            cordova: {
                options: {
                    style: 'compressed'
                },
                files: {
                    '<%= project.dist %>/<%= project.dir %>/styles/app.css': '<%= project.app %>/styles/app.scss'
                }
            }
        },

        jade: {
            server: {
                options: {
                    pretty: true,
                    data: {
                        debug: true,
                        ENV: 'local',
                        GIT_REVISION: '<%= project.revision %>',
                        VERSION: '<%= project.version %>',
                        DATE_STAMP: '<%= project.today.toString() %>',
                        YEAR: '<%= project.today.getFullYear() %>'
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= project.app %>',
                    dest: '<%= project.temp %>',
                    ext: '.html',
                    //every jade file that doesn’t start with an underscore (_)
                    src: [
                        '**/*.jade',
                        '!**/_*.jade'
                    ]
                }]
            },
            dev: {
                options: {
                    pretty: true,
                    data: {
                        debug: true,
                        ENV: 'dev',
                        GIT_REVISION: '<%= project.revision %>',
                        VERSION: '<%= project.version %>',
                        DATE_STAMP: '<%= project.today.toString() %>',
                        YEAR: '<%= project.today.getFullYear() %>'
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= project.src %>',
                    dest: '<%= project.temp %>',
                    ext: '.html',
                    src: [
                        '<%= project.dir %>/**/*.jade',
                        '!<%= project.dir %>/**/_*.jade'
                    ]
                }]
            },
            www: {
                options: {
                    pretty: true,
                    data: {
                        debug: false,
                        ENV: 'www',
                        GIT_REVISION: '<%= project.revision %>',
                        VERSION: '<%= project.version %>',
                        DATE_STAMP: '<%= project.today.toString() %>',
                        YEAR: '<%= project.today.getFullYear() %>'
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= project.src %>',
                    dest: '<%= project.temp %>',
                    ext: '.html',
                    src: [
                        '<%= project.dir %>/**/*.jade',
                        '!<%= project.dir %>/**/_*.jade'
                    ]
                }]
            },
            cordova: {
                options: {
                    pretty: true,
                    data: {
                        debug: false,
                        ENV: 'cordova',
                        GIT_REVISION: '<%= project.revision %>',
                        VERSION: '<%= project.version %>',
                        DATE_STAMP: '<%= project.today.toString() %>',
                        YEAR: '<%= project.today.getFullYear() %>'
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= project.src %>',
                    dest: '<%= project.temp %>',
                    ext: '.html',
                    src: [
                        '<%= project.dir %>/**/*.jade',
                        '!<%= project.dir %>/**/_*.jade'
                    ]
                }]
            },
            // 2 dist tasks needed as the usemin task breaks when
            // the jade templates are minified to a single line
            dist: {
                options: {
                    data: {
                        debug: false
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= project.app %>',
                    dest: '<%= project.dist %>/<%= project.dir %>',
                    ext: '.html',
                    src: [
                        '**/*.jade',
                        '!**/_*.jade'
                    ]
                }]
            },
            dist2: {
                options: {
                    pretty: true,
                    data: {
                        debug: false
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= project.app %>',
                    dest: '<%= project.dist %>/<%= project.dir %>',
                    ext: '.html',
                    src: [
                        '*.jade',
                        '!_*.jade'
                    ]
                }]
            }
        },

        ngmin: {
            cordova: {
                src: '<%= project.app %>/scripts/cordova.js',
                dest: '<%= project.temp %>/scripts/cordova.js'
            },
            app: {
                src: '<%= project.app %>/scripts/app.js',
                dest: '<%= project.temp %>/scripts/app.js'
            },
            components: {
                expand: true,
                cwd: '<%= project.app %>',
                src: ['components/**/*.js'],
                dest: '<%= project.temp %>'
            },
            controllers: {
                expand: true,
                cwd: '<%= project.app %>',
                src: ['controllers/**/*.js'],
                dest: '<%= project.temp %>'
            },
            directives: {
                expand: true,
                cwd: '<%= project.app %>',
                src: ['directives/**/*.js'],
                dest: '<%= project.temp %>'
            },
            filters: {
                expand: true,
                cwd: '<%= project.app %>',
                src: ['scripts/filters/**/*.js'],
                dest: '<%= project.temp %>'
            },
            services: {
                expand: true,
                cwd: '<%= project.app %>',
                src: ['scripts/services/**/*.js'],
                dest: '<%= project.temp %>'
            }

        },
        express: {
            server: {
                options: {
                    script: '<%= project.server %>'
                }
            }
        }
    });

    grunt.registerTask('server', 'Server tasks to test specified project', function () {
        grunt.task.run([
            'config.sh',
            'clean:server',
            'jsonlint:dist',
            'sass:server',
            'revision', //run revision before jade so it's available there
            'jade:server',
            'livereload-start',
            'express:server',
            'open',
            'watch'
        ]);
    });

    //FIXME express:start replaced
    grunt.registerTask('server:quick', ['livereload-start','express:start','open','watch']);

    grunt.registerTask('config.sh', function () {
        //make .config.sh from package.json for deploy.sh
        var packageJson = grunt.file.readJSON('package.json');
        var contents = sprintf('#Auto-generated by grunt build from values in package.json\nBASEDOMAIN="%s"\nHOST="%s";\nWWW_PORT="%d";\nDEV_PORT="%d";\nSSH_PORT="%d";\nDIR="%s";\n', packageJson.baseDomain, packageJson.host, +packageJson.ports.www, +packageJson.ports.dev, +packageJson.ports.ssh, packageJson.name);
        grunt.file.write('./.config.sh', contents);

        //read the version from package.json. destined for the footer of the site
        //given version "a.b.c", give me "a.b" - I don’t want to see ".c" though ".c" is required by node in the package.json file
        grunt.config.set('project.version', packageJson.version.replace(/\.\d+$/, ''));
    });
    grunt.registerTask('build', function (target) {
        target = target || 'dev';
        grunt.config('project.buildTarget', target);

        grunt.task.run([
            'config.sh',
            'clean:dist',
            'jshint',
            'jsonlint:dist',
            'revision', //run revision before jade so it's available there
            'jade:' + target,
            'copy:postJade', //.tmp/*.html files to dist
            'useminPrepare',
            'imagemin',
            'ngmin',
            'concat',
            'uglify',
            'copy:dist',
            'usemin',
            'sass:' + target,
            'usebanner' //add banner after everything else is done to js, css
        ]);

        if(target === 'cordova') {
            grunt.task.run([
                'clean:cordova',
                'copy:cordova'
            ]);
        }
    });

    grunt.registerTask('cordova', [
        'clean:cordova',
        'copy:cordova'
    ]);

};
