/*
 * - - - - - - - - - - - - - - - - - - - - - - -
 * Grunt Basic Template
 * - - - - - - - - - - - - - - - - - - - - - - -
 * command: grunt all
 *  * grunt watch && grunt connect:localhost
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
   	 _vendor	 = _package.config.files.js.vendor.src,
   	 _bridge  = grunt.file.readJSON('grunt/vendorBridge.json', { encoding: 'utf8' });

   var _bannerJSList = '';

   _bridge.paths.vendor.forEach(function (val, i, arr) {
   	_bannerJSList += ' * – ' + val + '\n';
   	arr[i] = path.join(_vendor, val);
   });

   function checkForModifiedImports(file, time, include){
		fs.readFile(file, "utf8", function(err, data) {
			var dir = path.dirname(file),
			regex = /@import (?:'|")(.+?)?(?:'|")/g,
			shouldInclude = false,
			match
			// console.log("check imports of", file)
			while ((match = regex.exec(data)) !== null) {
				// All of my js files are in the same directory,
				// other paths may need to be traversed for different setups...
				var importFile = path.resolve(dir + '/', match[1])
				// console.log("importFile", importFile)
				if (fs.existsSync(importFile)) {
					var stat = fs.statSync(importFile)
					if (stat.mtime > time) {
						shouldInclude = true
						break
					}
				}
			}
			include(shouldInclude)
		})
	}
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
      banner: 	'/*!\n' +
               ' * <%= pkg.name %> v<%= pkg.version %>\n' +
               ' * Compiled <%= grunt.template.today("yyyy-mm-dd") %> by <%= pkg.author %> (www.weigelstein.de)\n' +
               ' * \n' +
               ' * Included vendors:\n' +
               ' * --------------------------------------------------\n' +
               _bannerJSList +
               ' * --------------------------------------------------\n' +
               ' */\n',
		newer: {
			options: {
				override: function(detail, include) {
					if (detail.task === 'import' || detail.task === 'sass') {
						checkForModifiedImports(detail.path, detail.time, include)
					} else {
						include(false)
					}
				}
			}
		},

		// clean
      clean: {
         dist: '<%= pkg.dist %>',
         sprite:{
				src: [
               '<%= pkg.config.files.svg.clean %>/*.svg',
               '<%= pkg.config.files.svg.build %>/*.svg'
				]
			}
      },

      // JS build configuration
		lineremover: {
		  	es6Import: {
				files: {
					'<%= concat.vendor.dest %>': '<%= concat.vendor.dest %>'
				},
				options: {
					exclusionPattern: /^(import|export)/g
				}
		  	}
		},
		stamp: {
			options: {
				banner: '<%= banner %>\n'
			},
			vendor: {
				files: {
					src: '<%= concat.vendor.dest %>'
				}
			}
		},

      concat: {
			options: {
				stripBanners: false
			},
			vendor: {
				src:  _bridge.paths.vendor,
				dest: '<%= pkg.config.files.js.vendor.dest %>/vendor.js'
			}
		},

		// local server
		connect: {
			localhost: {
				port: '<%= pkg.config.localhost.port %>',
				base: '<%= pkg.config.localhost.path %>'
			}
		},

		// css
      sass: {
			compile: {
				files: {
					'<%= pkg.main %>/css/<%= pkg.config.namespace %>.css': '<%= pkg.config.files.scss %>/<%= pkg.config.namespace %>.scss',
				}
			},
			sourceMap: {
				options: {
					sourceMap: '<%= pkg.config.files.scss %>/<%= pkg.config.namespace %>.map'
				},
				files: {
					'<%= pkg.main %>/css/<%= pkg.config.namespace %>.css': '<%= pkg.config.files.scss %>/<%= pkg.config.namespace %>.scss'
				}
			},
			precision: {
				options: {
					precision: 10
				},
				files: {
					'<%= pkg.main %>/css/precision.css': '<%= pkg.config.files.scss %>/precision.scss'
				}
			}
		},
      postcss: {
			core: {
				options: {
					map: true,
               processors: [
   					require('autoprefixer')({browsers: ['> 1%', 'ie 10']})
   				]
				},
				src: '<%= pkg.main %>/css/*.css'
			},
		},
		csscomb: {
			options: {
				config: '<%= pkg.config.files.scss %>/.csscomb.json'
			},
			core: {
				expand: true,
				cwd: '<%= pkg.main %>/css/',
				src: ['*.css', '!*.min.css'],
				dest: '<%= pkg.main %>/css/'
			}
		},
		cssmin: {
			options: {
				compatibility: 'ie9',
				keepSpecialComments: '*',
				sourceMap: true,
				advanced: false
			},
			core: {
				files: [
					{
						expand: true,
						cwd: '<%= pkg.main %>/css',
						src: ['*.css', '!*.min.css'],
						dest: '<%= pkg.main %>/css',
						ext: '.min.css'
					}
				]
			}
		},
      uglify: {
			options: {
				compress: {
					warnings: false
				},
				mangle: true,
				preserveComments: /^!|@preserve|@license|@cc_on/i
			},
			vendor: {
				src: ['<%= concat.vendor.dest %>'],
				dest: '<%= pkg.config.files.js.vendor.dest %>/vendor.min.js'
			}
		},

		// svg min
		svgmin: {
			options: {

			},
			dist: {
				expand: true,
				cwd: '<%= pkg.config.files.svg.src %>',
				src: ['**/*.svg'],
				dest:'<%= pkg.config.files.svg.clean %>/',
			}
		},

		// svg sprite
		svg_sprite: {
			icons: {
				expand: true,
				cwd: '<%= pkg.config.files.svg.clean %>',
				src: ['**/*.svg'],
				dest: "./",
				options: {
					mode: {
						css: {
							bust: false,
							dest: '<%= pkg.config.files.scss %>',
							sprite: '../<%= pkg.config.files.svg.build %>/icons.svg',
							mixin: 'icons',
							render: {
								scss: {
									dest: '<%= pkg.config.namespace %>/_svgicons.scss',
									template: '<%= pkg.config.files.scss %>/ws/svgicons.mustache'
								}
							}
						}
					}
				}
			}
		},

      // fontello
      fontello: {
         dist: {
            options: {
               scss    : true,
               force   : true,
               config  : '<%= pkg.config.files.fontello.path %>config.json',
               fonts   : '<%= pkg.config.files.fontello.path %>font',
               styles  : '<%= pkg.config.files.fontello.path %>scss'
            }
         }
      },

		// watch task
		watch: {
			js: {
				files: [
					'<%= pkg.main %>/js/app/**/*.js',
               '<%= pkg.main %>/js/app/*.js',
               'grunt/vendorBridge.json'
				],
            tasks: ['dist-js'],
				// tasks: ['newer:import:dist', 'newer:uglify:dist'],
				options: {
					interrupt: true
				}
			},
			css: {
				files: '<%= pkg.sass %>',
				tasks: ['css'],
				options: {
					interrupt: true
				}
			},
			svg: {
				files: ['<%= pkg.config.files.svg.src %>/**/*.svg'],
				tasks: ['svgicons'],
			},
			html: {
				files: ['<%= pkg.main %>/*.html']
			},
			livereload: {
				files: [
					'<%= pkg.main %>/css/*.css',
					'<%= pkg.main %>/*.html',
					'<%= pkg.main %>/js/app/**/*.js'
				],
				options: {
					livereload: true
				}
			}
		},

      copy: {
         css: {
            expand: true,
            cwd: '<%= pkg.main %>/css',
            src: ['<%= pkg.config.namespace %>.css','<%= pkg.config.namespace %>.min.css'],
            dest: '<%= pkg.dist %>/css'
         },
         vendor: {
            expand: true,
            cwd: '<%= pkg.main %>/js/vendor',
            src: ['vendor.js','vendor.min.js'],
            dest: '<%= pkg.dist %>/js/vendor'
         },
         core: {
            expand: true,
            cwd: '<%= pkg.main %>/js/app',
            src: ['app.js','ws/*.js'],
            dest: '<%= pkg.dist %>/js/app'
         },
         assets: {
            expand: true,
            cwd: '<%= pkg.main %>/js/app/ws',
            src: ['ajax.js','fx.js','share.js','slick.js','pointerManager.js'],
            dest: '<%= pkg.dist %>/js/app/ws'
         }
      },

		// concurrent tasks
		concurrent: {
			tasks: [['connect:localhost'],['watch']],
			options: {
				logConcurrentOutput: true
			}
		}
	}); // initConfig

   // These plugins provide necessary tasks.
   require('load-grunt-tasks')(grunt);
   require('time-grunt')(grunt);

   grunt.registerTask('vendor', ['concat:vendor','lineremover','stamp:vendor','uglify:vendor']);
	grunt.registerTask('dist-js', ['copy:vendor','copy:core','copy:assets']);

   grunt.registerTask('dist-css', ['sass','postcss:core','cssmin:core','copy:css']);
   grunt.registerTask('default', ['dist-css']);

	grunt.registerTask('all', ['concurrent']);
	grunt.registerTask('css', ['sass','postcss:core','cssmin:core','copy:css']);
	grunt.registerTask('svgicons', ['clean:sprite', 'svgmin:dist', 'svg_sprite:icons']);
}
