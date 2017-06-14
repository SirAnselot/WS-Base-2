/*
 * - - - - - - - - - - - - - - - - - - - - - - -
 * Grunt Basic Template
 * - - - - - - - - - - - - - - - - - - - - - - -
 * command: grunt all
	 * grunt watch && grunt connect:localhost
 * command: grunt watch
	 * sass -> autoprefixer -> cssmin -> livereload
	 * js -> concat files -> uglify -> livereload
	 * html -> livereload
 * command: grunt connect:localhost
	 * opens local server on 127.0.0.1:8080 (needed for livereload)
 */
module.exports = function(grunt) {

   // Force use of Unix newlines
   grunt.util.linefeed = '\n'

   RegExp.quote = function (string) {
     return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
   }

	var fs = require('fs');
	var path = require('path');
   var glob = require('glob');

   // var generateCommonJSModule = require('./grunt/bs-commonjs-generator.js');
   var _package = grunt.file.readJSON('package.json'),
   	 _config  = grunt.file.readJSON('wyg.json', { encoding: 'utf8' });

   var _glyphList = '{';
   _config.glyphs.forEach(function (val, i, arr) {
   	_glyphList += '"' + val.css + '": "' + val.selected + '",\n';
   });
   _glyphList = '}';

   console.log(_glyphList);

	grunt.initConfig({
		pkg: _package,

		// clean
      clean: {
         dist: '<%= pkg.dist %>'
      },

      // fontello
      fontello: {
         dist: {
            options: {
               config  : 'wyg.json',
               fonts   : '<%= pkg.files.fontello.font %>',
               styles  : '<%= pkg.files.fontello.css %>',
               scss    : false,
               force   : true
            }
         }
      },

      copy: {
         fonts: {
            expand: true,
            cwd: 'font/',
            src: ['wygelsteyn.eot','wygelsteyn.svg','wygelsteyn.ttf','wygelsteyn.woff','wygelsteyn.woff2'],
            dest: '<%= pkg.dist %>'
         }
      },
	}); // initConfig
   require('load-grunt-tasks')(grunt);
   grunt.loadNpmTasks('grunt-fontello');

   grunt.registerTask('default', ['copy:fonts']);
}
