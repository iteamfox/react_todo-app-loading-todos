import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import * as todoService from './api/todos';
import { Header } from './components/Header';
import { Todo } from './types/Todo';
import { Footer } from './components/Footer';
import { TodoList } from './components/TodoList';
import { ErrorNotification } from './components/ErrorNotification';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [updatingTodoIds, setUpdatingTodoIds] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!todoService.USER_ID) {
      return;
    }

    setIsLoading(true);
    setError('');

    todoService
      .getTodos()
      .then(setTodos)
      .catch(() => setError('Unable to load todos'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddTodo = async (title: string) => {
    if (!title.trim()) {
      setError('Title should not be empty');

      return;
    }

    const newTempTodo: Todo = {
      id: 0,
      title: title.trim(),
      completed: false,
      userId: todoService.USER_ID,
    };

    setTempTodo(newTempTodo);
    setUpdatingTodoIds(ids => [...ids, 0]);
    setInputValue('');

    try {
      const newTodo = await todoService.addTodo({
        userId: todoService.USER_ID,
        title: title.trim(),
        completed: false,
      });

      setTodos(current => [...current, newTodo]);
    } catch {
      setError('Unable to add a todo');
    } finally {
      setTempTodo(null);
      setUpdatingTodoIds(ids => ids.filter(id => id !== 0));
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    setUpdatingTodoIds(prev => [...prev, todoId]);

    try {
      await todoService.deleteTodo(todoId);
      setTodos(current => current.filter(todo => todo.id !== todoId));
    } catch {
      setError('Unable to delete a todo');
    } finally {
      setUpdatingTodoIds(prev => prev.filter(id => id !== todoId));
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    setUpdatingTodoIds(ids => [...ids, todo.id]);

    try {
      const updatedTodo = await todoService.updateTodo(
        todo.id,
        !todo.completed,
      );

      setTodos(current =>
        current.map(t => (t.id === todo.id ? updatedTodo : t)),
      );
    } catch {
      setError('Unable to update a todo');
    } finally {
      setUpdatingTodoIds(ids => ids.filter(id => id !== todo.id));
    }
  };

  const handleDeleteCompletedTodos = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    await Promise.all(
      completedTodos.map(async todo => {
        setUpdatingTodoIds(prev => [...prev, todo.id]);
        try {
          await todoService.deleteTodo(todo.id);
          setTodos(prev => prev.filter(t => t.id !== todo.id));
        } catch {
          setError('Unable to delete a todo');
        } finally {
          setUpdatingTodoIds(prev => prev.filter(id => id !== todo.id));
        }
      }),
    );

    inputRef.current?.focus();
  };

  if (!todoService.USER_ID) {
    return <UserWarning />;
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          onAdd={handleAddTodo}
          todos={todos}
          isLoading={isLoading}
          inputValue={inputValue}
          setInputValue={setInputValue}
          inputRef={inputRef}
        />

        <TodoList
          todos={filteredTodos}
          toggleTodo={handleToggleTodo}
          updatingTodoIds={updatingTodoIds}
          tempTodo={tempTodo}
          onDelete={handleDeleteTodo}
        />

        {todos.length > 0 && (
          <Footer
            todos={todos}
            currentFilter={filter}
            onFilterChange={setFilter}
            onClearCompleted={handleDeleteCompletedTodos}
          />
        )}

        <ErrorNotification errorMessage={error} onClose={() => setError('')} />
      </div>
    </div>
  );
};
