/* eslint-disable jsx-a11y/label-has-associated-control */
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Todo as TodoType } from '../types/Todo';
import { TodoListItem } from './TodoListItem';

type Props = {
  filteredTodos: TodoType[];
  onDelete: (id: number) => void;
  onEdit: (id: number, data: Partial<TodoType>) => void;
  tempTodo: TodoType | null;
  idsProcessing: number[];
  inputRef: React.RefObject<HTMLInputElement>;
};

export const TodoList: React.FC<Props> = ({
  filteredTodos,
  onDelete,
  onEdit,
  tempTodo,
  idsProcessing,
  inputRef,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      <TransitionGroup>
        {filteredTodos.map(({ id, title, completed }) => (
          <CSSTransition key={id} timeout={300} classNames="item">
            <TodoListItem
              id={id}
              title={title}
              completed={completed}
              onDelete={onDelete}
              onEdit={onEdit}
              idsProcessing={idsProcessing}
              inputRef={inputRef}
            />
          </CSSTransition>
        ))}

        {tempTodo && (
          <CSSTransition key={tempTodo.id} timeout={300} classNames="temp-item">
            <TodoListItem
              id={tempTodo.id}
              title={tempTodo.title}
              completed={tempTodo.completed}
              onDelete={onDelete}
              onEdit={onEdit}
              idsProcessing={idsProcessing}
              isTemp={true}
              inputRef={inputRef}
            />
          </CSSTransition>
        )}
      </TransitionGroup>
    </section>
  );
};
