import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import * as todoService from './api/todos';
import { Header } from './components/Header';
import { Todo } from './types/Todo';
import { Footer } from './components/Footer';
import { TodoList } from './components/TodoList';
import { ErrorNotification } from './components/ErrorNotification';

function getFilteredTodos(
  todos: Todo[],
  filter: 'all' | 'active' | 'completed',
): Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingTodoIds, setUpdatingTodoIds] = useState<number[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

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
    setIsLoading(true);

    const newTempTodo: Todo = {
      id: 0,
      title,
      completed: false,
      userId: todoService.USER_ID,
    };

    setTempTodo(newTempTodo);
    setUpdatingTodoIds(ids => [...ids, 0]);

    todoService
      .addTodo({ userId: todoService.USER_ID, title, completed: false })
      .then(newTodo => setTodos(prev => [...prev, newTodo]))
      .catch(() => setError('Unable to add a todo'))
      .finally(() => {
        setIsLoading(false);
        setTempTodo(null);
        setUpdatingTodoIds(ids => ids.filter(id => id !== 0));
      });
  };

  const handleDeleteTodo = async (id: number) => {
    setIsLoading(true);
    setUpdatingTodoIds(prev => [...prev, id]);

    try {
      await todoService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch {
      setError('Unable to delete a todo');
    } finally {
      setIsLoading(false);
      setUpdatingTodoIds(prev => prev.filter(todoId => todoId !== id));
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    setIsLoading(true);
    setUpdatingTodoIds(ids => [...ids, todo.id]);

    try {
      const updated = await todoService.updateTodo(todo.id, !todo.completed);

      setTodos(prev => prev.map(t => (t.id === todo.id ? updated : t)));
    } catch {
      setError('Unable to update a todo');
    } finally {
      setIsLoading(false);
      setUpdatingTodoIds(ids => ids.filter(id => id !== todo.id));
    }
  };

  const handleDeleteCompletedTodos = async () => {
    const completed = todos.filter(t => t.completed);

    await Promise.all(
      completed.map(async todo => {
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
  };

  const handleToggleAll = async () => {
    const shouldCompleteAll = !todos.every(todo => todo.completed);

    await Promise.all(
      todos.map(todo =>
        handleToggleTodo({ ...todo, completed: shouldCompleteAll }),
      ),
    );
  };

  if (!todoService.USER_ID) {
    return <UserWarning />;
  }

  const visibleTodos = getFilteredTodos(todos, filter);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <Header
          todos={todos}
          isLoading={isLoading}
          disabled={isLoading}
          onAdd={handleAddTodo}
          onToggleAll={handleToggleAll}
        />
        <TodoList
          todos={visibleTodos}
          toggleTodo={handleToggleTodo}
          isLoading={isLoading}
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
