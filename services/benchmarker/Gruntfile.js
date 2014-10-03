module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: pkg,
    traceur: {
      options: {
        modules: 'commonjs',
        sourceMaps: true
      },
      src: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**/*.js'],
          dest: 'dist'
        }]
      }
    },
    execute: {
      launch: {
        src: ['dist/app.js']
      }
    }
  });

  grunt.registerTask('default' , '', function() {
    grunt.task.run('traceur:src', 'execute:launch');
  });

  grunt.registerTask('build', function() {
    grunt.task.run('traceur:src');
  });
};