// Selectores
const toDoInput = document.querySelector('#input');
const toDoBtn = document.querySelector('#enter');
const toDoList = document.querySelector('#lista-tareas');

// Endpoint de la API
const apiUrl = 'https://6677456b145714a1bd744a91.mockapi.io/ToDoApp';

// Event listener para añadir tarea al presionar Enter
toDoInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addToDo(e);
    }
});

if (toDoBtn) {
    toDoBtn.addEventListener('click', addToDo);
}
if (toDoList) {
    toDoList.addEventListener('click', deleteOrCheckTodo);
}
document.addEventListener("DOMContentLoaded", fetchTodos);

function addToDo(event) {
    if (event.type === 'keypress' && event.key !== 'Enter') {
        return;
    }

    event.preventDefault();

    const todoText = toDoInput.value.trim();
    if (todoText === '') {
        alert("Debes ingresar una tarea!");
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
        addTodoToDOM(data, true); // Añadir nueva tarea al principio
        toDoInput.value = '';
    })
    .catch(error => {
        console.error('Error adding todo:', error);
    });
}

function deleteOrCheckTodo(event) {
    const item = event.target;
    const todoItem = item.closest('.tasks');

    if (item.classList.contains('delete-btn')) {
        const todoId = todoItem.dataset.id;
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
            todoItem.remove();
        })
        .catch(error => {
            console.error('Error deleting todo:', error);
        });
    }

    if (item.classList.contains('check-btn')) {
        const todoId = todoItem.dataset.id;
        const currentStatus = todoItem.classList.contains('completed') ? 'ready' : 'On hold';

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
            toggleTodoStatus(todoItem);
            // Reorder tasks after status change
            fetchTodos();
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
        todoElement.classList.remove('completed');
        todoElement.classList.add('pending');
        // Mover tarea completada al principio
        toDoList.insertBefore(todoElement, toDoList.firstChild);
    } else {
        todoTextElement.innerHTML = `<del>${todoTextElement.innerText}</del>`;
        todoElement.classList.remove('pending');
        todoElement.classList.add('completed');
    }
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
        // Clear current list
        toDoList.innerHTML = '';
        // Sort data: uncompleted tasks first
        data.sort((a, b) => (a.status === 'On hold') - (b.status === 'On hold'));
        data.forEach(todo => addTodoToDOM(todo, false));
    })
    .catch(error => {
        console.error('Error fetching todos:', error);
    });
}

function addTodoToDOM(todo, addToTop) {
    const todoItem = document.createElement('li');
    todoItem.classList.add('tasks');
    todoItem.dataset.id = todo.id;

    const taskText = document.createElement('span');
    taskText.classList.add('todo-item');
    taskText.innerText = todo.task;

    if (todo.status === 'On hold') {
        todoItem.classList.add('completed');
        taskText.innerHTML = `<del>${todo.task}</del>`;
    } else {
        todoItem.classList.add('pending');
    }

    const checkBtn = document.createElement('img');
    checkBtn.src = './storage/img/listo.png';
    checkBtn.alt = 'check';
    checkBtn.classList.add('check-btn');

    const deleteBtn = document.createElement('img');
    deleteBtn.src = './storage/img/basura.png';
    deleteBtn.alt = 'trash';
    deleteBtn.classList.add('delete-btn');

    todoItem.appendChild(taskText);
    todoItem.appendChild(checkBtn);
    todoItem.appendChild(deleteBtn);

    if (addToTop) {
        toDoList.insertBefore(todoItem, toDoList.firstChild); // Añadir nueva tarea al principio
    } else {
        toDoList.appendChild(todoItem);
    }
}
