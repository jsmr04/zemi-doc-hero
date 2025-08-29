import { Todo } from "./todo.types";
import { todoList } from "./todo.model";
import { logger } from "../../../plugins/winston";

//INFO: Add your all business logic here

let todos = [...todoList]
export const getTodos = ()=> {
    logger.info(" -> todo.getTodos()")
    return todos
}

export const getTodo = (id: number)=> {
    const todo = todos.filter(item=>item.id === id)
    if (todo.length > 0) return todo[0]
}

export const addTodo = (todo: Todo)=> {
    todos.push(todo)
    return todo
}

export const deleteTodo = (id: number)=> {
    todos = todos.filter(item => item.id !== id)
}

export const updateTodo = (id: number, todo: Todo)=> {
    const index = todos.findIndex(item => item.id === id)
    if (!index) return

    todos[index] = todo
    return todos[index]
}