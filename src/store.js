import Vue from 'vue'
import Vuex from 'vuex'
import {
  fetchTodos,
  addTodo,
  deleteTodo,
  updateTodo,
  toggleTodos
} from '@/api/todo'
Vue.use(Vuex)

const STORAGE_KEY = 'vuetify-todos'

const state = {
  todos: JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
}

const mutations = {
  addTodo (state, todo) {
    state.todos.push(todo)
  },
  removeTodo (state, todo) {
    const foundIndex = state.todos.findIndex(element => element.id === todo.id)
    state.todos.splice(foundIndex, 1)
  },
  editTodo (state, { todo }) {
    const foundIndex = state.todos.findIndex(element => element.id === todo.id)
    state.todos.splice(foundIndex, 1, todo)
  },
  setTodos (state, todos) {
    state.todos = todos
  }
}

const actions = {
  addTodo: async ({ commit }, text) => {
    try {
      const todo = await addTodo(text)
      commit('addTodo', todo[0])
    } catch (exception) {
      if (!exception.status) {
        commit('addTodo', {
          uid: Date.now(),
          text,
          done: false
        })
      }
    }
  },
  removeTodo: async ({ commit }, todo) => {
    try {
      const deletedTodo = await deleteTodo(todo.id)
      commit('removeTodo', deletedTodo[0])
    } catch (exception) {
      if (!exception.status) {
        commit('removeTodo', todo)
      }
    }
  },
  toggleTodo: async ({ commit }, todo) => {
    try {
      const updatedTodo = await updateTodo(todo.id, todo.text, !todo.done)
      commit('editTodo', {
        todo: updatedTodo[0]
      })
    } catch (exception) {
      if (!exception.status) {
        todo.done = !todo.done
        commit('editTodo', {
          todo
        })
      }
    }
  },
  editTodo: async ({ commit }, { todo, value }) => {
    try {
      const updatedTodo = await updateTodo(todo.id, value)
      commit('editTodo', {
        todo: updatedTodo[0]
      })
    } catch (exception) {
      if (!exception.status) {
        todo.text = value
        commit('editTodo', {
          todo
        })
      }
    }
  },
  toggleAll: async ({ state, commit }, done) => {
    const ids = state.todos.map(todo => todo.id)
    const todos = [...state.todos].map(todo => {
      return { text: todo.text, done: done }
    })

    try {
      const toggledTodos = await toggleTodos(todos, ids)
      toggledTodos.forEach(todo => {
        commit('editTodo', {
          todo: todo
        })
      })
    } catch (exception) {
      if (!exception.status) {
        state.todos.forEach((todo) => {
          todo.done = done
          commit('editTodo', {
            todo
          })
        })
      }
    }
  },
  clearCompleted: async ({ state, commit }) => {
    const completedTodos = state.todos.filter(todo => todo.done)
    try {
      const deletedTodos = await deleteTodo(completedTodos.map(todo => todo.id))
      deletedTodos.forEach(todo => {
        commit('removeTodo', todo)
      })
    } catch (exception) {
      if (!exception.status) {
        state.todos.filter(todo => todo.done)
          .forEach(todo => {
            commit('removeTodo', todo)
          })
      }
    }
  },
  fetchTodos: async ({ commit }) => {
    const { todos } = await fetchTodos()
    commit('setTodos', todos)
  }
}

const plugins = [store => {
  store.subscribe((mutation, { todos }) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  })
}]

export default new Vuex.Store({
  state,
  mutations,
  actions,
  plugins
})
