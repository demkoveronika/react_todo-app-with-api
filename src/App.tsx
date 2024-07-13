/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import * as todoService from './api/todos';

import { FilterBy } from './types/FilterBy';
import { filterTodos } from './utils/filterTodos';

import { Todo } from './types/Todo';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { ErrorNotification } from './components/ErrorNotification';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [valueError, setValueError] = useState('');
  const [filterBy, setFilterBy] = useState<FilterBy>(FilterBy.All);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [idsProcessing, setIdsProcessing] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  const autoHideNotification = () => {
    setTimeout(() => {
      setValueError('');
    }, 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const todosFromServer = await todoService.getTodos();

        setTodos(todosFromServer);
      } catch (error) {
        setValueError('Unable to load todos');
        autoHideNotification();
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTodos = filterTodos(todos, filterBy);

  useEffect(() => {
    inputRef.current?.focus();
  }, [todos, filterBy, tempTodo, valueError]);

  const handleAddTodo = async (newTodo: Todo) => {
    setTodos(prevTodos => [...prevTodos, newTodo]);
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      setIdsProcessing([todoId]);
      await todoService.deleteTodo(todoId);
      setTodos(currentTodos => currentTodos.filter(todo => todo.id !== todoId));
      inputRef.current?.focus();
    } catch (error) {
      setValueError('Unable to delete a todo');
      autoHideNotification();
    } finally {
      setTempTodo(null);
      setIdsProcessing([]);
    }
  };

  const handleEditTodo = async (id: number, data: Partial<Todo>) => {
    try {
      setIdsProcessing([id]);
      const editedTodo = await todoService.patchTodo(id, data);

      setTodos(currentTodos =>
        currentTodos.map(todo => {
          if (todo.id === id) {
            return editedTodo;
          }

          return todo;
        }),
      );
    } catch (error) {
      setValueError('Unable to update a todo');
      autoHideNotification();
      throw new Error('Unable to update a todo');
    } finally {
      setIdsProcessing([]);
    }
  };

  const activeTodos = todos.filter(todo => !todo.completed).length;
  const completedTodos = todos.length - activeTodos;

  const handleToggleAll = async () => {
    if (completedTodos === todos.length) {
      try {
        setIdsProcessing(todos.map(todo => todo.id));

        const updatedTodos = await Promise.all(
          todos.map(todo =>
            todoService.patchTodo(todo.id, { completed: false }),
          ),
        );

        setTodos(updatedTodos);
      } catch (error) {
        setValueError('Unable to update todos');
      } finally {
        setIdsProcessing([]);
      }

      return;
    }

    const allActiveTodos = todos.filter(todo => !todo.completed);
    const activeIds = allActiveTodos.map(todo => todo.id);

    setIdsProcessing(activeIds);

    try {
      await Promise.all(
        allActiveTodos.map(todo =>
          todoService.patchTodo(todo.id, { completed: true }),
        ),
      );

      setTodos(currentTodos =>
        currentTodos.map(todo => {
          if (!todo.completed) {
            return { ...todo, completed: true };
          }

          return todo;
        }),
      );
    } catch (error) {
      setValueError('Unable to update todos');
    } finally {
      setIdsProcessing([]);
    }
  };

  const handleFilter = (selectedFilter: FilterBy) => {
    setFilterBy(selectedFilter);
  };

  const handleCloseNotifications = () => {
    setValueError('');
  };

  if (!todoService.USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          setValueError={setValueError}
          autoHideNotification={autoHideNotification}
          onAdd={handleAddTodo}
          setTempTodo={setTempTodo}
          onToggleAll={handleToggleAll}
          activeTodos={activeTodos}
          completedTodos={completedTodos}
          isLoading={isLoading}
          inputRef={inputRef}
        />

        {filteredTodos.length > 0 && (
          <TodoList
            filteredTodos={filteredTodos}
            tempTodo={tempTodo}
            onDelete={handleDeleteTodo}
            onEdit={handleEditTodo}
            idsProcessing={idsProcessing}
            inputRef={inputRef}
          />
        )}

        {todos.length > 0 && (
          <Footer
            todos={todos}
            filter={filterBy}
            activeTodos={activeTodos}
            onFilter={handleFilter}
            onDelete={handleDeleteTodo}
          />
        )}
      </div>

      <ErrorNotification
        valueError={valueError}
        onClose={handleCloseNotifications}
      />
    </div>
  );
};
