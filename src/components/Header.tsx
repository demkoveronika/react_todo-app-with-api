import { useState } from 'react';
import { Todo } from '../types/Todo';
import cn from 'classnames';
import * as todoService from './../api/todos';

type Props = {
  activeTodos: number;
  completedTodos: number;
  setValueError: (e: string) => void;
  setTempTodo: React.Dispatch<React.SetStateAction<Todo | null>>;
  isLoading: boolean;
  autoHideNotification: () => void;
  onAdd: (todo: Todo) => void;
  onToggleAll: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
};

export const Header: React.FC<Props> = ({
  activeTodos,
  completedTodos,
  setValueError,
  isLoading,
  autoHideNotification,
  onAdd,
  onToggleAll,
  setTempTodo,
  inputRef,
}) => {
  const [valueTitle, setValueTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (valueTitle.trim() === '') {
      setValueError('Title should not be empty');
      autoHideNotification();
      inputRef.current?.focus();

      return;
    }

    const trimmedTitle = valueTitle.trim();
    const newTodo: Todo = {
      id: 0,
      title: trimmedTitle,
      userId: todoService.USER_ID,
      completed: false,
    };

    setTempTodo(newTodo);

    try {
      setIsSubmitting(true);

      const createdTodo = await todoService.createTodo({
        title: trimmedTitle,
        userId: newTodo.userId,
        completed: newTodo.completed,
      });

      onAdd(createdTodo);

      setValueTitle('');
      setTempTodo(null);
      inputRef.current?.focus();
    } catch (error) {
      setValueError('Unable to add a todo');
      autoHideNotification();
      inputRef.current?.focus();
    } finally {
      setTempTodo(null);
      setIsSubmitting(false);
    }
  };

  return (
    <header className="todoapp__header">
      {(activeTodos > 0 || completedTodos > 0) && !isLoading && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', {
            active: activeTodos === 0,
          })}
          data-cy="ToggleAllButton"
          onClick={onToggleAll}
        />
      )}
      <form onSubmit={handleSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          value={valueTitle}
          onChange={e => setValueTitle(e.target.value)}
          ref={inputRef}
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          disabled={isSubmitting}
        />
      </form>
    </header>
  );
};
