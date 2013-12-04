module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            options: {
                spawn: false
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
                files: ['src/index.html'],
                tasks: ['copy']
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
            main: {
                src: 'src/index.html',
                dest: 'dist/',
                flatten: true,
                expand: true,
                includePaths: 'src/css/'
            },

            js: {
                src: '**/*',
                dest: 'dist/js/',
                flatten: false,
                expand: true,
                cwd: 'src/js/'
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
                    hostname: '*'
                }
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

    // Tasks
    grunt.registerTask('js', ['jshint', 'copy:js']);
    grunt.registerTask('build', ['clean', 'js', 'copy', 'sass']);
    grunt.registerTask('default', ['build', 'connect', 'watch']);
};
