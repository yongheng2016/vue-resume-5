import Vue from 'vue'
import AV from 'leancloud-storage'

var APP_ID = 'NDq6o1WeRH26BTgdoqbxRU1z-gzGzoHsz';
var APP_KEY = 'ltAyGDUOLKulxJJKChWHwCIY';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});


var app = new Vue({
  el: '#app',
  data: {
    actionType: 'signUp',
    newTodo: '',
    todoList: [],
    currentUser: null,
    formData: {
      username: '',
      password: ''
    }
  },
  created: function (){
    this.currentUser = this.getCurrentUser();
    this.fetchTodos() // 将原来的一坨代码取一个名字叫做 fetchTodos
  },

  methods: {
    fetchTodos: function(){
      if(this.currentUser){
        var query = new AV.Query('AllTodos');
        query.find()
          .then((todos) => {
            console.log('------------------------')
            let avAllTodos = todos[todos.length-1] // 因为理论上 AllTodos 只有一个，所以我们取结果的第一项
            let id = avAllTodos.id
            this.todoList = JSON.parse(avAllTodos.attributes.content) // 为什么有个 attributes？因为我从控制台看到的
            this.todoList.id = id // 为什么给 todoList 这个数组设置 id？因为数组也是对象啊
          }, function(error){
            console.error('-------->'+error) 
          })
      }
    },
    updateTodos: function(){
      // 想要知道如何更新对象，先看文档 https://leancloud.cn/docs/leanstorage_guide-js.html#更新对象
      let dataString = JSON.stringify(this.todoList) // JSON 在序列化这个有 id 的数组的时候，会得出怎样的结果？
      let avTodos = AV.Object.createWithoutData('AllTodos', this.todoList.id)
      avTodos.set('content', dataString)
      avTodos.save().then(()=>{
        console.log('更新成功')
      })
    },
    saveTodos: function(){
      let dataString = JSON.stringify(this.todoList)
      var AVTodos = AV.Object.extend('AllTodos');
      var avTodos = new AVTodos();
      var acl = new AV.ACL()
      acl.setReadAccess(AV.User.current(),true) // 只有这个 user 能读
      acl.setWriteAccess(AV.User.current(),true) // 只有这个 user 能写

      avTodos.set('content', dataString);
      avTodos.setACL(acl) // 设置访问控制
      avTodos.save().then(function (todo) {
        this.todoList.id = todo.id  // 一定要记得把 id 挂到 this.todoList 上，否则下次就不会调用 updateTodos 了
        alert('保存成功');
      }, function (error) {
        alert('保存失败');
      });
    },
    saveOrUpdateTodos: function(){
      if(this.todoList.id){
        this.updateTodos()
      }else{
        this.saveTodos()
      }
    },
    addTodo: function (){
      this.todoList.push({
        title: this.newTodo,
        createdAt: new Date(),
        done: false
      })
      this.newTodo = ''
      this.saveTodos()
    },
    removeTodo: function (todo){
      let index = this.todoList.indexOf(todo)
      this.todoList.splice(index,1)
      this.saveOrUpdateTodos() // 不能用 saveTodos 了
    },
    signUp: function () {
      let user = new AV.User();
      user.setUsername(this.formData.username);
      user.setPassword(this.formData.password);
      user.signUp().then((loginedUser) => { 
        this.currentUser = this.getCurrentUser() 
      }, (error) => {
        alert('注册出错')
      });
    },
    login: function () {
      AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => { // 👈
        this.currentUser = this.getCurrentUser() 
        this.fetchTodos() // 登录成功后读取 todos
      }, function (error) {
        alert('登陆出错') 
      });
    },
    getCurrentUser: function () { 
      let {id, createdAt, attributes: {username}} = AV.User.current()
      return {id, username, createdAt} 
    },
    logout: function (){
      AV.User.logOut()
      this.currentUser = null
      window.location.reload()
    }
  }
})  