import React, { useEffect } from 'react';
import { Todo } from '../types/Todo';

type Props = {
  onAdd: (title: string) => void;
  todos: Todo[];
  isLoading: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
};

export const Header: React.FC<Props> = ({
  onAdd,
  todos,
  isLoading,
  inputValue,
  setInputValue,
  inputRef,
}) => {
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading, inputRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(inputValue);
  };

  return (
    <header className="todoapp__header">
      <button
        type="button"
        className={`todoapp__toggle-all ${
          todos.length > 0 && todos.every(todo => todo.completed)
            ? 'active'
            : ''
        }`}
      />
      <form onSubmit={handleSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          disabled={isLoading}
          ref={inputRef}
        />
      </form>
    </header>
  );
};
