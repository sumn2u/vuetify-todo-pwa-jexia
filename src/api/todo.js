import api from './index'
const API_URL = process.env.VUE_APP_API_BASE || ''

const fetchTodos = async () => {
  const todos = await api.get(`${API_URL}/ds/todos`, {
    params: {
      outputs: JSON.stringify(['id', 'text', 'done'])
    } })
  return { todos }
}

const addTodo = async (
  text
) => {
  return api.post(`${API_URL}/ds/todos`, {
    data: {
      uuid: Date.now(),
      text,
      done: false
    }
  })
}
const deleteTodo = async (id) => {
  /**
   *  while deleting a single record we grab the id of the record
   *  but in case of deleting all records we garb the ids of the
   *  records that needs to be deleted
   */
  const deleteCondition = Array.isArray(id) ? JSON.stringify([{ field: 'done' }, '=', true]) : JSON.stringify([{ field: 'id' }, '=', id])
  return api.delete(`${API_URL}/ds/todos`, {
    params: {
      cond: deleteCondition
    }
  })
}

const updateTodo = async (
  id,
  text,
  done) => {
  return api.patch(`${API_URL}/ds/todos`, {
    params: {
      cond: JSON.stringify([{
        field: 'id'
      }, '=', id])
    },
    data: {
      text,
      done: done
    }
  })
}
const toggleTodos = async (todos) => {
  return api.patch(`${API_URL}/ds/todos`, {
    params: {
      cond: JSON.stringify([{
        field: 'done'
      }, '!=', null])
    },
    data: todos
  })
}

export {
  fetchTodos, addTodo, deleteTodo, updateTodo, toggleTodos
}
