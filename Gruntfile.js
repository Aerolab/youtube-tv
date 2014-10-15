module.exports = function(grunt) {

  grunt.initConfig({
    nodewebkit: {
      options: {
        app_name: "Remote",
        app_version: "0.0.1",
        zip: false, // No zip for the mac app

        version: "0.10.5", // Node-webkit version
        build_dir: "./build",

        mac_icns: "./assets/icon.icns",
        mac: true,
        win: true,
        linux32: false,
        linux64: false
      },
      src: ["./package.json", "./assets/**", "./node_modules/**", "!./node_modules/grunt*/**"]
    },

    // We need to copy FFMPEG libraries to add support for videos and mp3s
    copy: {
      main: {
        files: [
          {
            src: 'libraries/windows/ffmpegsumo.dll',
            dest: 'build/cache/win/0.10.5/ffmpegsumo.dll',
            flatten: true
          },
          {
            src: 'libraries/mac/ffmpegsumo.so',
            dest: 'build/cache/mac/0.10.5/node-webkit-v0.10.5-osx-ia32/node-webkit.app/Contents/Frameworks/node-webkit Framework.framework/Libraries/ffmpegsumo.so',
            flatten: true
          }
        ]
      }
    }
  });


  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-node-webkit-builder");

  grunt.registerTask("nodewebkitbuild", ["nodewebkit", "copy"]);
  grunt.registerTask("copylibs", ["copy"]);

 };
