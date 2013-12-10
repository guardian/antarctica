module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            options: {
                spawn: false,
                livereload: true
            },
            js: {
                files: ['src/js/**/*'],
                tasks: ['js']
            },
            sass: {
                files: ['src/css/**/*'],
                tasks: ['sass']
            },
            html: {
                files: ['src/*.html'],
                tasks: ['copy:html']
            }
        },

        sass: {
            dist: {
                files: {
                    'dist/css/antarctica-main.css': 'src/css/antarctica-main.scss'
                }
            }
        },

        copy: {
            html: {
                src: 'src/*.html',
                dest: 'dist/',
                flatten: true,
                expand: true
            },

            js: {
                src: '**/*',
                dest: 'dist/js/',
                flatten: false,
                expand: true,
                cwd: 'src/js/'
            },

            imgs: {
                src: 'src/imgs/*',
                dest: 'dist/imgs/',
                flatten: true,
                expand: true
            }
        },

        jshint: {
            all: ['Gruntfile.js', 'src/js/*.js', 'src/js/app/**/*.js']
        },

        connect: {
            server: {
                options: {
                    port: 9999,
                    base: 'dist',
                    hostname: '*',
                    open: true
                }
            }
        },

        aws_s3: {
            options: {
                bucket: 'gdn-cdn',
                region: 'us-east-1',
                access: 'public-read',
                uploadConcurrency: 5
            },
            debug: {
                options: {
                    debug: true
                },
                files: [
                    {
                        action: 'upload',
                        expand: true,
                        cwd: 'dist/',
                        src: ['**'],
                        dest: 'embed/antarctica-2013/',
                        params: {
                            'CacheControl': 'max-age=60, public'
                        }
                    }
                ]
            },
            prod: {
                files: [
                    {
                        action: 'upload',
                        expand: true,
                        cwd: 'dist/',
                        src: ['**'],
                        dest: 'embed/antarctica-2013/',
                        params: {
                            'CacheControl': 'max-age=60, public'
                        }
                    }
                ]
            }
        },

        clean: ['dist']

    });

    // Loads
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-aws-s3');

    // Tasks
    grunt.registerTask('js', ['jshint', 'copy:js']);
    grunt.registerTask('build', ['clean', 'js', 'copy', 'sass']);
    grunt.registerTask('default', ['build', 'connect', 'watch']);
    grunt.registerTask('dry-run', ['build', 'aws_s3:debug']);
    grunt.registerTask('deploy', ['build', 'aws_s3:prod']);

};
