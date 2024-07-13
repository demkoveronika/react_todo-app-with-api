/* eslint-disable jsx-a11y/label-has-associated-control */
import cn from 'classnames';
import { useState } from 'react';
import { Todo as TodoType } from '../types/Todo';
import { TodoForm } from './TodoForm';

type Props = {
  id: number;
  title: string;
  completed: boolean;
  onDelete: (id: number) => void;
  onEdit: (id: number, data: Partial<TodoType>) => void;
  idsProcessing: number[];
  isTemp?: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
};

export const TodoListItem: React.FC<Props> = ({
  id,
  title,
  completed,
  onDelete,
  onEdit,
  idsProcessing,
  isTemp = false,
  inputRef,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleCompleted = async (isCompleted: boolean) => {
    try {
      await onEdit(id, { completed: isCompleted });
    } catch {
      // eslint-disable-next-line no-console
      console.log('Error editing todo');
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(id);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error deleting todo');
    }
  };

  const handleFormattedTitle = async (valueTitle: string) => {
    const formattedTitle = valueTitle.trim();

    if (!formattedTitle) {
      return handleDelete();
    }

    if (valueTitle === title) {
      setIsEditing(false);

      return;
    }

    try {
      await onEdit(id, { title: formattedTitle });

      setIsEditing(false);
    } catch (error) {
      inputRef.current?.focus();
    }
  };

  return (
    <div
      data-cy="Todo"
      className={cn('todo', { completed: completed })}
      key={id}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          onClick={() => handleCompleted(!completed)}
          checked={completed}
        />
      </label>

      {isEditing ? (
        <div onKeyUp={({ key }) => key === 'Escape' && setIsEditing(false)}>
          <TodoForm
            title={title}
            onSubmit={handleFormattedTitle}
            inputRef={inputRef}
          />
        </div>
      ) : (
        <span
          data-cy="TodoTitle"
          className="todo__title"
          onDoubleClick={() => setIsEditing(true)}
        >
          {title}
        </span>
      )}

      {!isEditing && (
        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDelete"
          onClick={handleDelete}
        >
          ×
        </button>
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active': idsProcessing.includes(id) || isTemp,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
