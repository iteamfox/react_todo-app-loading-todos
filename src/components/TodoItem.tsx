/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { Todo } from '../types/Todo';
import { Loader } from './Loader';

type Props = {
  todo: Todo;
  toggleTodo: (todo: Todo) => void;
  onDelete: (todoId: number) => void;
  isUpdating: boolean;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  toggleTodo,
  onDelete,
  isUpdating,
}) => {
  return (
    <div
      data-cy="Todo"
      className={`todo ${todo.completed ? 'completed' : ''}`}
      key={todo.id}
      // eslint-disable-next-line react/jsx-no-comment-textnodes
    >
      // eslint-disable-next-line jsx-a11y/label-has-associated-control
      <label className="todo__status-label" htmlFor={`todo-${todo.id}`}>
        <input
          id={`todo-${todo.id}`}
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={() => toggleTodo(todo)}
        />
      </label>
      <span data-cy="TodoTitle" className="todo__title">
        {todo.title}
      </span>
      <button
        type="button"
        className="todo__remove"
        data-cy="TodoDelete"
        onClick={() => onDelete(todo.id)}
      >
        ×
      </button>
      <Loader isActive={isUpdating} />
    </div>
  );
};
