module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: pkg,
    copy: {
      frontend: {
        files: [
          {expand: true, flatten: true, src: ['./src/frontend/**/*.html', './src/frontend/**/*.css'], dest: './dist/frontend/'},
          {expand: true, flatten: true, src: ['./src/frontend/lib/**/*'], dest: './dist/frontend/lib'}
        ]
      }
    },
    traceur: {
      options: {
        modules: 'commonjs',
        sourceMaps: true
      },
      src: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['server/**/*.js'],
          dest: 'dist'
        }]
      }
    },
    execute: {
      launch: {
        src: ['dist/server/app.js']
      }
    },
    browserify: {
      benchmarker: {
        files: {
          'dist/frontend/app.js': ['src/frontend/app.js']
        }
      }
    },
    watch: {
      frontend: {
        files: ['src/**/*'],
        tasks: ['traceur:src', 'copy:frontend', 'browserify:benchmarker', 'execute:launch']
      }
    }
  });

  grunt.registerTask('default' , '', function() {
    grunt.task.run('traceur:src', 'copy:frontend', 'browserify:benchmarker', 'execute:launch', 'watch:frontend');
  });

  grunt.registerTask('build', function() {
    grunt.task.run('traceur:src', 'copy:frontend', 'browserify:benchmarker');
  });
};