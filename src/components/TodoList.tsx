import React from 'react';
import { Todo } from '../types/Todo';
import { TodoItem } from './TodoItem';

type Props = {
  todos: Todo[];
  toggleTodo: (todo: Todo) => void;
  updatingTodoIds: number[];
  tempTodo: Todo | null;
  onDelete: (todoId: number) => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  toggleTodo,
  updatingTodoIds,
  tempTodo,
  onDelete,
}) => {
  return (
    <div className="todoapp__list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          toggleTodo={toggleTodo}
          onDelete={onDelete}
          isUpdating={updatingTodoIds.includes(todo.id)}
        />
      ))}

      {tempTodo && (
        <TodoItem
          todo={tempTodo}
          toggleTodo={() => {}}
          onDelete={() => {}}
          isUpdating={true}
        />
      )}
    </div>
  );
};
