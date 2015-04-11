module.exports = function(grunt) {

  grunt.initConfig({  //各个要定义的任务
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      jade: {  //静态html需要在前台直接使用而不是通过jade从后台输出 监听jade文件变更触发真个服务重启比较方便
        files: ['views/**'],  //需要监听设置文件改变的目录
        options: {
          livereload: true
        }
      },
      js: {
        files: ['public/js/**', 'models/**/*.js', 'schemas/**/*.js'],
        //tasks: ['jshint'],  语法检查
        options: {
          livereload: true //文件出现改动重启服务
        }
      },
    },

    nodemon: {
      dev: {  //开发环境
        options: {
          file: 'app.js', //入口文件
          args: [],  //配置项 
          ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
          watchedExtensions: ['js'],
          watchedFolders: ['./'],
          debug: true,
          delayTime: 1, //等待多少毫秒重启服务（很多文件时不必等每个文件修改重启 ）
          env: {
            PORT: 3000
          },
          cwd: __dirname  //目录为当前目录
        }
      }
    },


    concurrent: {
      tasks: ['nodemon', 'watch'],  //传入任务 重新执行它们
      options: {
        logConcurrentOutput: true
      }
    }
  })
  //加载安装的任务插件
  grunt.loadNpmTasks('grunt-contrib-watch')  //文件添加修改删除就会重新执行在它里面注册的任务 
  grunt.loadNpmTasks('grunt-nodemon') //实时监听app.js 入口文件改动自动重启 对app.js包装
  grunt.loadNpmTasks('grunt-concurrent')  //针对慢任务 sass less的编译 优化它们 跑多个组测任务


  grunt.option('force', true) //便于开发不要因为语法错误或警告中断了grunt整个任务

  grunt.registerTask('default', ['concurrent'])  //默认任务

}