'use strict';

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var path = require('path');

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
            server: '<%= project.src %>/app.js'
        },

        watch: {
            sass: {
                files: [
                    '<%= project.app %>/**/*.{scss,sass}'
                ],
                tasks: ['sass:server']
            },
            jade: {
                files: [
                    '<%= project.app %>/**/*.jade'
                ],
                tasks: ['jade:server']
            },
            livereload: {
                files: [
                    '<%= project.app %>/*.html',
                    '<%= project.app %>/views/**/*.html',
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
                '<%= project.app %>/scripts/**/*.js'
            ]
        },

        useminPrepare: {
            html: ['<%= project.app %>/*.html','<%= project.temp %>/*.html'],
            options: {
                baseUrl: '<%= project.app %>',
                dest: '<%= project.dist %>/<%= project.dir %>'
            }
        },

        usemin: {
            html: ['<%= project.dist %>/<%= project.dir %>/*.html'],
            css: ['<%= project.dist %>/<%= project.dir %>/styles/*.css'],
            options: {
                dirs: ['<%= project.dist %>/<%= project.dir %>']
            }
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
                        'services/**/*',
                        'package.json',
                        'routes.js',
                        'server.js'
                    ]
                },{
                    expand: true,
                    dest: '<%= project.dist %>',
                    src: [
                        'package.json'
                    ]
                }]
            }
        },

        sass: {
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
            dist: {
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
                        debug: true
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= project.app %>',
                    dest: '<%= project.temp %>',
                    ext: '.html',
                    src: [
                        '**/*.jade',
                        '!**/_*.jade'
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

        awsdeploy: {
            options: {
                name: '<%= project.pkg.name %>'
            }
        },

        express: {
            server: {
                options: {
                    port: '<%= project.port %>',
                    hostname: '<%= project.hostname %>',
                    configPath: '<%= project.server %>',
                    baseUrl: '<%= project.baseUrl %>'
                }
            }
        }
    });

    grunt.registerTask('server', 'Server tasks to test specified project', function () {
        grunt.task.run([
            'clean:server',
            'sass:server',
            'jade:server',
            'livereload-start',
            'express:server',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('server:quick', ['livereload-start','express:start','open','watch']);

    grunt.registerTask('build', [
        'clean:dist',
        'jshint',
        'sass:dist',
        'jade',
        'useminPrepare',
        'imagemin',
        'ngmin',
        'concat',
        'uglify',
        'copy:dist',
        'usemin'
    ]);

};
