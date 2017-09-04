import Vue from 'vue'
import AV from 'leancloud-storage'

var APP_ID = 'c9axAXkQIrq8CG5rAo0y6bMX-gzGzoHsz';
var APP_KEY = 'NopFzxbndred34hpGerrblR8';
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
      this.currentUser = this.getCurrentUser()
  },
  methods: {
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
        alert('保存成功');
      }, function (error) {
        alert('保存失败');
      });
    },
    addTodo: function (){
      this.todoList.push({
        title: this.newTodo,
        createdAt: new Date(),
        done: false
      })
      this.newTodo = ''
    },
    removeTodo: function (todo){
      let index = this.todoList.indexOf(todo)
      this.todoList.splice(index,1)
    },
    signUp: function () {
      let user = new AV.User();
      user.setUsername(this.formData.username);
      user.setPassword(this.formData.password);
      user.signUp().then((loginedUser) => { 
        this.currentUser = this.getCurrentUser() 
      }, (error) => {
        alert(error) 
      });
    },
    login: function () {
      AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => { // 👈
        this.currentUser = this.getCurrentUser() 
      }, function (error) {
        alert(error) 
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