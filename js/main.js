// Selectores
const toDoInput = document.querySelector('#input');
const toDoBtn = document.querySelector('#enter');
const toDoList = document.querySelector('#lista-tareas');

// Endpoint de la API
const apiUrl = 'https://6674179975872d0e0a950e53.mockapi.io/todoList';

// Event Listeners
if (toDoBtn) {
    toDoBtn.addEventListener('click', addToDo);
}
if (toDoList) {
    toDoList.addEventListener('click', deleteOrCheckTodo);
}
document.addEventListener("DOMContentLoaded", fetchTodos);

// Funciones
function addToDo(event) {
    event.preventDefault();

    const todoText = toDoInput.value.trim();
    if (todoText === '') {
        alert("You must write something!");
        return;
    }

    const todoData = {
        task: todoText,
        status: 'ready'
    };

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todoData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        addTodoToDOM(data);
        toDoInput.value = '';
    })
    .catch(error => {
        console.error('Error adding todo:', error);
    });
}

function deleteOrCheckTodo(event) {
    const item = event.target;

    if (item.classList.contains('delete-btn')) {
        const todoId = item.parentElement.dataset.id;
        const status = item.parentElement.classList.contains('completed') ? 'ready' : 'On hold';

        if (status === 'ready') {
            fetch(`${apiUrl}/${todoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                item.parentElement.remove();
            })
            .catch(error => {
                console.error('Error deleting todo:', error);
            });
        } else {
            alert('You can only delete completed tasks.');
        }
    }

    if (item.classList.contains('check-btn')) {
        const todoId = item.parentElement.dataset.id;
        const currentStatus = item.parentElement.classList.contains('completed') ? 'On hold' : 'ready';

        fetch(`${apiUrl}/${todoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: currentStatus })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            toggleTodoStatus(item.parentElement);
        })
        .catch(error => {
            console.error('Error updating todo status:', error);
        });
    }
}

function toggleTodoStatus(todoElement) {
    const todoTextElement = todoElement.querySelector('.todo-item');

    if (todoElement.classList.contains('completed')) {
        todoTextElement.innerHTML = todoTextElement.innerText;
    } else {
        todoTextElement.innerHTML = `<del>${todoTextElement.innerText}</del>`;
    }

    todoElement.classList.toggle('completed');
}

function fetchTodos() {
    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        data.forEach(todo => addTodoToDOM(todo));
    })
    .catch(error => {
        console.error('Error fetching todos:', error);
    });
}

function addTodoToDOM(todo) {
    const todoItem = document.createElement('li');
    todoItem.innerText = todo.task;
    todoItem.classList.add('todo-item');

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.classList.add('delete-btn');

    const checkBtn = document.createElement('button');
    checkBtn.innerHTML = '<i class="fas fa-check"></i>';
    checkBtn.classList.add('check-btn');

    const todoDiv = document.createElement('div');
    todoDiv.classList.add('items_list');
    todoDiv.dataset.id = todo.id;
    todoDiv.appendChild(todoItem);
    todoDiv.appendChild(deleteBtn);
    todoDiv.appendChild(checkBtn);

    if (todo.status === 'On hold') {
        todoDiv.classList.add('completed');
        todoItem.innerHTML = `<del>${todo.task}</del>`;
    }

    const ulElement = document.createElement('ul');
    ulElement.classList.add('lista');
    ulElement.appendChild(todoDiv);

    toDoList.appendChild(ulElement);
}

