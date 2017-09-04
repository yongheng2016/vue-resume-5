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
    window.onbeforeload=()=>{
      let dataString = JSON.stringify(this.todoList)
      var Todo = AV.Object.extend('Todo');
      var todo = new Todo();
      todo.set('content', dataString);
      todo.save().then(function (todo) {
        console.log('New object created with objectId: ' + todo.id);
      }, function (error) {
        console.error('Failed to create new object, with error message: ' + error.message);
      });
      this.currentUser = this.getCurrentUser()
    }
  },
  methods: {
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