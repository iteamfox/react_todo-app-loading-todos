import React, { useEffect, useRef, useState } from 'react';
import { Todo } from '../types/Todo';

type Props = {
  todos: Todo[];
  isLoading: boolean;
  disabled: boolean;
  onAdd: (title: string) => void;
  onToggleAll: () => void;
};

export const Header: React.FC<Props> = ({
  todos,
  isLoading,
  disabled,
  onAdd,
  onToggleAll,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = inputValue.trim();

    if (!title) {
      return;
    }

    onAdd(title);
    setInputValue('');
    inputRef.current?.focus();
  };

  return (
    <header className="todoapp__header">
      <button
        type="button"
        className={`todoapp__toggle-all ${todos.length > 0 && todos.every(todo => todo.completed) ? 'active' : ''}`}
        onClick={onToggleAll}
        disabled={isLoading}
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
