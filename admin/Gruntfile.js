module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: pkg,
    traceur: {
      options: {
        modules: 'commonjs',
        sourceMaps: true,
        includeRuntime: true,
        generators: 'parse'
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
        options: {
          nodeargs: ['--harmony']
        },
        src: ['dist/admin.js']
      },
      destroy: {
        src: ['dist/destroy.js']
      },
      test: {
        options: {
          nodeargs: ['--harmony']
        },
        src: ['dist/test/gen.js']
      }
    }
  });

  grunt.registerTask('default' , '', function() {
    grunt.task.run('traceur:src', 'execute:launch');
  });

  grunt.registerTask('build', function() {
    grunt.task.run('traceur:src');
  });

  grunt.registerTask('destroy', function() {
    grunt.task.run('traceur:src', 'execute:destroy');
  });

  grunt.registerTask('test', function() {
    grunt.task.run('traceur:src', 'execute:test');
  });
};